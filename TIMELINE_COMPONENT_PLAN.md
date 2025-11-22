# Timeline Component Implementation Plan

## Overview
Implement a horizontal timeline component that displays tracks as segments on a time-based scale, similar to the screenshot. The timeline shows:
- Track segments with title/artist labels
- Active track highlighting
- Time-of-day scale (HH:MM format)
- Red triangular indicator for current playback position

## Phase 1: Backend - Add Track Offset to API

### 1.1 Update API Response
- **File**: `packages/api-server/src/router/routes/channel/get-channel-tracks.ts`
- **Action**: Add `offset` field to `ChannelTrackOutput` interface
- **Details**: The offset represents the track's position in the playlist timeline (in milliseconds)

### 1.2 Update Frontend Types
- **File**: `packages/frontend/src/app/actions.ts`
- **Action**: Add `offset: z.number()` to `ChannelTrackSchema`
- **Details**: This will allow the frontend to receive track timing information

## Phase 2: Timeline Component Structure

### 2.1 Create Timeline Component
- **Location**: `packages/frontend/src/components/ChannelTimeline/ChannelTimeline.tsx`
- **Props**:
  - `tracks: ChannelTrack[]` - Array of tracks with offset and duration
  - `nowPlaying: { track: ChannelTrack; position: number } | null` - Current playback info
  - `channelStartedAt: Date | null` - When the channel started (for time-of-day calculation)
  - `playlistDuration: number` - Total duration of the playlist (in milliseconds)
  - `timeWindow: number` - Time range to display (default: 30 minutes)

### 2.2 Component Features
1. **Track Segments**:
   - Calculate each track's position on timeline based on `offset`
   - Calculate width based on `duration`
   - Display truncated title/artist text
   - Highlight active track (darker background)

2. **Time Scale**:
   - Calculate time-of-day based on `channelStartedAt` + offset
   - Display time markers (e.g., 15:35, 15:40, 15:45)
   - Show appropriate time range based on visible window

3. **Playback Indicator**:
   - Calculate current position: `channelStartedAt + offset + position`
   - Position red triangular indicator at correct location
   - Update indicator position in real-time using `useNowPlaying` hook

4. **Layout**:
   - Horizontal scrollable container
   - Responsive design (mobile: stack vertically or scroll horizontally)
   - Gray color palette (adhere to style guide)

## Phase 3: Timeline Calculations

### 3.1 Time Calculations
- **Current Time**: Calculate from `channelStartedAt` + elapsed time
- **Track Start Time**: `channelStartedAt + track.offset`
- **Track End Time**: `trackStartTime + track.duration`
- **Playback Position**: `channelStartedAt + nowPlaying.track.offset + nowPlaying.position`

### 3.2 Position Calculations
- **Timeline Width**: Based on `timeWindow` (e.g., 30 minutes = 1800000ms)
- **Track Segment Position**: `(track.offset % playlistDuration) / timeWindow * timelineWidth`
- **Track Segment Width**: `track.duration / timeWindow * timelineWidth`
- **Indicator Position**: `(playbackPosition % playlistDuration) / timeWindow * timelineWidth`

### 3.3 Handle Playlist Looping
- Tracks repeat when playlist duration is exceeded
- Use modulo operation: `position % playlistDuration`
- Show multiple instances of tracks if they appear multiple times in the visible window

## Phase 4: Component Implementation

### 4.1 Create Utility Functions
- **File**: `packages/frontend/src/components/ChannelTimeline/utils.ts`
- **Functions**:
  - `calculateTimeOfDay(startTime: Date, offset: number): Date` - Convert offset to time-of-day
  - `formatTimeOfDay(date: Date): string` - Format as HH:MM
  - `calculateTimelinePosition(offset: number, timeWindow: number, timelineWidth: number): number`
  - `calculateSegmentWidth(duration: number, timeWindow: number, timelineWidth: number): number`

### 4.2 Main Component Structure
```tsx
<div className="relative">
  {/* Timeline bar with track segments */}
  <div className="relative h-16 bg-gray-100 rounded-lg overflow-x-auto">
    {tracks.map(track => (
      <TrackSegment 
        key={track.id}
        track={track}
        isActive={isActive}
        position={calculatePosition(track)}
        width={calculateWidth(track)}
      />
    ))}
  </div>
  
  {/* Time scale below */}
  <div className="relative mt-2">
    <TimeScale 
      startTime={startTime}
      timeWindow={timeWindow}
      timelineWidth={timelineWidth}
    />
  </div>
  
  {/* Playback indicator */}
  {nowPlaying && (
    <PlaybackIndicator 
      position={calculateIndicatorPosition(nowPlaying)}
    />
  )}
</div>
```

### 4.3 Track Segment Component
- **File**: `packages/frontend/src/components/ChannelTimeline/TrackSegment.tsx`
- **Features**:
  - Rounded corners
  - Truncated text (title/artist)
  - Active state styling (darker background)
  - Tooltip on hover (full title/artist)

### 4.4 Time Scale Component
- **File**: `packages/frontend/src/components/ChannelTimeline/TimeScale.tsx`
- **Features**:
  - Tick marks at regular intervals (e.g., every 5 minutes)
  - Time labels (HH:MM format)
  - Aligned with timeline bar

### 4.5 Playback Indicator Component
- **File**: `packages/frontend/src/components/ChannelTimeline/PlaybackIndicator.tsx`
- **Features**:
  - Red triangular shape pointing upward
  - Positioned on time scale
  - Updates in real-time

## Phase 5: Integration

### 5.1 Get Channel Start Time
- **Backend**: Check if channel info endpoint includes `startedAt` timestamp
- **Frontend**: Add `startedAt` to `ChannelResponse` type if needed
- **Action**: Fetch channel start time to calculate time-of-day

### 5.2 Add Timeline to Channel Page
- **File**: `packages/frontend/src/views/channel/Channel.tsx`
- **Location**: Add above or below the tracklist
- **Props**: Pass tracks, nowPlaying, channel info

### 5.3 Handle Edge Cases
- Channel not started: Show placeholder or disable timeline
- No tracks: Show empty state
- Tracks not loaded: Show loading state
- Playlist looping: Handle tracks that appear multiple times

## Phase 6: Styling & Polish

### 6.1 Style Guide Compliance
- Gray color palette
- No hover effects
- Cursor always arrow
- Mobile-optimized
- Minimalistic design

### 6.2 Responsive Design
- Desktop: Full-width timeline with horizontal scroll
- Mobile: Compact timeline or vertical layout alternative

### 6.3 Performance
- Use `useMemo` for calculations
- Virtualize if many tracks
- Debounce real-time updates if needed

## Implementation Order

1. **Backend**: Add `offset` to API response
2. **Frontend Types**: Update `ChannelTrackSchema` to include `offset`
3. **Utilities**: Create calculation functions
4. **Components**: Build TrackSegment, TimeScale, PlaybackIndicator
5. **Main Component**: Assemble ChannelTimeline component
6. **Integration**: Add to Channel page
7. **Testing**: Verify calculations and real-time updates
8. **Styling**: Apply style guide and responsive design

## Notes

- Timeline should handle playlist looping (tracks repeat)
- Time-of-day calculation requires channel start time
- Real-time updates use existing `useNowPlaying` hook
- Consider adding zoom/pan functionality for longer playlists
- May need to load additional tracks if timeline window extends beyond loaded tracks

