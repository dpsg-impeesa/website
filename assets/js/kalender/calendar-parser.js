// Client-Side Multi-Calendar Feed Parser using ical.js
// This script fetches and parses multiple iCalendar/ICS feeds in the browser
// and combines them into a single JSON object with source tracking
// Only showing current and future events
// Features: Custom colors and external feed configuration

const locale = 'de-DE';

/**
 * Parse multiple calendar feeds and combine the events
 * @param {Object[]} feeds - Array of feed objects with url, name, and color properties
 * @param {boolean} futureDateFilter - If true, only include current and future events
 * @returns {Promise<Object>} Combined events with source information
 */
async function parseCalendarFeeds(feeds, futureDateFilter = true) {
  try {
    // CORS proxy to handle cross-origin requests (if needed)
    // Replace with your preferred CORS proxy if required
    const corsProxy = ''; // e.g., 'https://api.cors.lol/?url='
    
    // Get current date (start of day) for filtering
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Array to store all parsing promises
    const parsePromises = feeds.map(async (feed) => {
      try {
        // Fetch the calendar feed with CORS handling
        const url = corsProxy + feed.url;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${feed.name}: ${response.status}`);
        }
        
        const icsData = await response.text();
        
        // Parse the iCalendar data using ical.js
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const events = comp.getAllSubcomponents('vevent');
        
        // Transform ICAL.js events into our format and add source information
        let parsedEvents = events.map(event => {
          const icalEvent = new ICAL.Event(event);
          
          // Get start and end dates
          let startDate = null;
          let endDate = null;
          let isAllDay = false;
          let jsStartDate = null;
          
          if (icalEvent.startDate) {
            jsStartDate = icalEvent.startDate.toJSDate();
            startDate = jsStartDate.toISOString();
            isAllDay = icalEvent.startDate.isDate;
          }
          
          if (icalEvent.endDate) {
            endDate = icalEvent.endDate.toJSDate().toISOString();
          }
          
          // Extract attendees if any
          const attendees = [];
          const attendeeProps = event.getAllProperties('attendee');
          attendeeProps.forEach(prop => {
            const attendee = {
              email: prop.getFirstValue(),
              name: prop.getParameter('cn') || '',
              role: prop.getParameter('role') || '',
              status: prop.getParameter('partstat') || ''
            };
            attendees.push(attendee);
          });
          
          // Build the standardized event object
          return {
            uid: icalEvent.uid || '',
            source: {
              name: feed.name,
              url: feed.url,
              color: feed.color || null  // Include the custom color from feed config
            },
            summary: icalEvent.summary || '',
            description: icalEvent.description || '',
            location: icalEvent.location || '',
            start: startDate,
            jsStartDate: jsStartDate, // Temporary for filtering
            end: endDate,
            created: icalEvent.created ? icalEvent.created.toJSDate().toISOString() : null,
            lastModified: icalEvent.lastModified ? icalEvent.lastModified.toJSDate().toISOString() : null,
            status: icalEvent.status || '',
            organizer: icalEvent.organizer ? {
              email: icalEvent.organizer,
              name: event.getFirstProperty('organizer')?.getParameter('cn') || ''
            } : null,
            attendees: attendees,
            recurrence: !!icalEvent.recurrenceId,
            recurrenceRule: icalEvent.recurrenceId ? icalEvent.recurrenceId.toString() : null,
            categories: event.getFirstProperty('categories') ? 
                        event.getFirstProperty('categories').getValues() : 
                        [],
            allDay: isAllDay
          };
        });
        
        // Filter out past events if requested
        if (futureDateFilter) {
          parsedEvents = parsedEvents.filter(event => {
            // Skip events without start dates
            if (!event.jsStartDate) return false;
            
            // Keep all-day events that are today or in the future
            if (event.allDay) {
              const eventDate = new Date(
                event.jsStartDate.getFullYear(),
                event.jsStartDate.getMonth(),
                event.jsStartDate.getDate()
              );
              return eventDate >= today;
            }
            
            // Keep timed events that haven't ended yet
            return event.jsStartDate >= now;
          });
        }
        
        // Remove temporary jsStartDate property used for filtering
        parsedEvents.forEach(event => {
          delete event.jsStartDate;
        });
        
        return parsedEvents;
      } catch (error) {
        console.error(`Error parsing feed ${feed.name}:`, error);
        return []; // Return empty array in case of error
      }
    });
    
    // Wait for all feeds to be processed
    const allEvents = await Promise.all(parsePromises);
    
    // Flatten array of arrays into a single array
    const combinedEvents = allEvents.flat();
    
    // Create the final output object
    return {
      metadata: {
        totalFeeds: feeds.length,
        totalEvents: combinedEvents.length,
        generatedAt: new Date().toISOString(),
        includePastEvents: !futureDateFilter,
        feeds: feeds.map(feed => ({ 
          name: feed.name, 
          url: feed.url,
          color: feed.color || null
        }))
      },
      events: combinedEvents
    };
  } catch (error) {
    console.error('Error in parseCalendarFeeds:', error);
    throw error;
  }
}

/**
 * Load calendar feeds configuration from a JSON file
 * @param {string} configUrl - URL to the feeds configuration JSON file
 * @returns {Promise<Object[]>} Array of feed configuration objects
 */
async function loadCalendarFeedsConfig(configUrl) {
  try {
    const response = await fetch(configUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to load calendar configuration: ${response.status}`);
    }
    
    const config = await response.json();
    
    // Validate the configuration has the required structure
    if (!Array.isArray(config.feeds)) {
      throw new Error('Invalid calendar configuration: feeds property must be an array');
    }
    
    // Check each feed has required properties
    config.feeds.forEach((feed, index) => {
      if (!feed.url) {
        console.warn(`Feed at index ${index} is missing a URL`);
      }
      if (!feed.name) {
        feed.name = `Calendar ${index + 1}`;
        console.warn(`Feed at index ${index} is missing a name, using '${feed.name}'`);
      }
    });
    
    return config.feeds;
  } catch (error) {
    console.error('Error loading feeds configuration:', error);
    throw error;
  }
}


/**
 * Example function to render calendar events to the DOM
 * @param {Array} events - Array of calendar events
 */

function renderCalendarEvents(events) {
  const container = document.getElementById('calendar-container');
  if (!container) return;
  
  // container.innerHTML = '';
  
  if (events.length === 0) {
    const noEventsMsg = document.createElement('p');
    noEventsMsg.className = 'no-events-message';
    noEventsMsg.textContent = 'No upcoming events found.';
    container.appendChild(noEventsMsg);
    return;
  }
  
  // Sort events by start date
  events.sort((a, b) => {
    if (!a.start) return 1;
    if (!b.start) return -1;
    return new Date(a.start) - new Date(b.start);
  });
  
  // Group events by month + year
  const eventsByMonth = {};
  
  events.forEach(event => {
    if (!event.start) return;
    
    const eventDate = new Date(event.start);
    // Create a month+year key (e.g., "2025-04" for April 2025)
    const monthKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
    
    if (!eventsByMonth[monthKey]) {
      eventsByMonth[monthKey] = [];
    }
    
    eventsByMonth[monthKey].push(event);
  });
  
  // Create a section for each month
  Object.keys(eventsByMonth).sort().forEach(monthKey => {
    const monthEvents = eventsByMonth[monthKey];
    
    // Parse year and month from the key
    const [year, month] = monthKey.split('-');
    
    // Create month+year header
    const monthHeader = document.createElement('h2');
    monthHeader.className = 'month-header';
    
    // Format the month and year
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const options = { month: 'long', year: 'numeric' };
    monthHeader.textContent = date.toLocaleDateString(locale, options);
    
    container.appendChild(monthHeader);
    
    // Sort events within this month by date
    monthEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    
    // Group by day for sub-organization
    const eventsByDay = {};
    monthEvents.forEach(event => {
      const eventDate = new Date(event.start);
      const dayKey = eventDate.getDate();
      
      if (!eventsByDay[dayKey]) {
        eventsByDay[dayKey] = [];
      }
      
      eventsByDay[dayKey].push(event);
    });
    
    // Add events for each day in this month
    Object.keys(eventsByDay).sort((a, b) => parseInt(a) - parseInt(b)).forEach(day => {
      const dayEvents = eventsByDay[day];
      
  
      
      // Add events for this day
      dayEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `calendar-event ${event.source.name}`;
      
        
        // Use the custom color if provided, otherwise generate one
        const eventColor = event.source.color || getColorForSource(event.source.name);
        eventElement.style.borderLeft = `0.3rem solid ${eventColor}`;
        
        const title = document.createElement('h3');
        title.textContent = event.summary;
        title.style.color = eventColor;
        title.className   = 'event-title';
        
        const time = document.createElement('p');
      
        time.className = 'event-time';

        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        
    
        let timeText = '';
        // same day
        if (endDate.getDate() === startDate.getDate()) {
          const options = { day: 'numeric', month: 'numeric' };
          timeText += `${startDate.toLocaleDateString(locale, options)} `;
        }
        // same year
        else if (endDate.getFullYear() === startDate.getFullYear()) {
          const  options = { day: 'numeric', month: 'numeric' };
          timeText += `${startDate.toLocaleDateString(locale, options)} - ${endDate.toLocaleDateString(locale, options)} `;
        } 
        // different year
        else {
          const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
          timeText += `${startDate.toLocaleDateString(locale, options)} - ${endDate.toLocaleDateString(locale, options)} `;
        }

        if (event.allDay) {
          timeText += 'Ganztägig';

        } else {
          const startTimeOptions = { hour: 'numeric', minute: '2-digit', hour24: true };
          timeText += `${startDate.toLocaleTimeString(locale, startTimeOptions)}`;
          
          // Add end time if available
          if (event.end) {
            const endTimeOptions = { hour: 'numeric', minute: '2-digit', hour24: true };
            timeText += ` - ${endDate.toLocaleTimeString(locale, endTimeOptions)}`;
          }
          
          timeText += ` Uhr`;
        }
        
        time.textContent = timeText;

        eventElement.appendChild(title);
        eventElement.appendChild(time);

        if (event.description) {
          splitDescription = event.description.split('\n');
          description = document.createElement('div');
          description.className = 'event-description';
          for (let i = 0; i < splitDescription.length; i++) {
            const line = document.createElement('p');
            line.className = 'event-description-line';
            line.innerHTML = marked.parseInline(splitDescription[i]);
            description.appendChild(line);
          }
          eventElement.appendChild(description);
        }

        
        
        const source = document.createElement('p');
        source.className = 'event-source';
        source.textContent = event.source.name;
        source.style.color = eventColor;
        eventElement.appendChild(source);
        
        if (event.location) {
          const location = document.createElement('p');
          location.className = 'event-location';
          location.textContent = `📍 ${event.location}`;
          eventElement.appendChild(location);
        }
        
        container.appendChild(eventElement);
      });
    });
  });
}

/**
 * Generate a consistent color based on calendar name (fallback if custom color not provided)
 * @param {string} sourceName - Name of calendar source
 * @returns {string} HEX color
 */
function getColorForSource(sourceName) {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < sourceName.length; i++) {
    hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}


// Initialize calendar processing
async function initCalendar(configUrl = 'calendar-config.json', showPastEvents = false) {
  try {
    // Check if ical.js is loaded
    if (typeof ICAL === 'undefined') {
      throw new Error('ICAL.js library not loaded! Please include it in your HTML.');
    }
    
    // Load the calendar configuration
    const calendarFeeds = await loadCalendarFeedsConfig(configUrl);
    
    // Process the calendars
    const result = await parseCalendarFeeds(calendarFeeds, !showPastEvents);
    
    // Update the UI with the results
    renderCalendarEvents(result.events);
    
    // Optionally show the raw JSON
    const outputElement = document.getElementById('calendar-output');
    if (outputElement) {
      outputElement.textContent = JSON.stringify(result, null, 2);
    }
    
    return result;
  } catch (error) {
    console.error('Calendar initialization failed:', error);
    
    // Show error in the UI
    const container = document.getElementById('calendar-container');
    if (container) {
      container.innerHTML = `
        <div class="calendar-error">
          <h3>Calendar Error</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
    
    const outputElement = document.getElementById('calendar-output');
    if (outputElement) {
      outputElement.textContent = `Error: ${error.message}`;
    }
    
    throw error;
  }
}