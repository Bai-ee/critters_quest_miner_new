# Crazy Critters UI Style Guide

## Overview

This style guide documents the **existing** UI patterns, tokens, and component standards currently used in the Crazy Critters application. It serves as a reference for maintaining consistency across the codebase without introducing new dependencies or frameworks.

**Technology Stack:** Next.js 15.5.2, Phaser 3.88.2, Tailwind CSS 3.4.1, React 19.1.1

## Design Principles (Observed)

Based on codebase analysis, the following design principles are consistently applied:

- **Dark-first design** with primary green (#23740D) as the dominant background color
- **High contrast** with black borders and white text for readability
- **Rounded corners** using consistent border radius patterns (rounded-lg, rounded-xl, rounded-2xl)
- **Bold, uppercase typography** with text shadows for emphasis
- **Metallic/industrial aesthetic** with yellow (#FFB84A) accent colors
- **Consistent spacing** using Tailwind's spacing scale (2.5, 5, 10, etc.)
- **Accessible focus states** with visible focus rings and proper contrast

## Token Inventory (Extracted)

### Colors

| Token/Name | Value | Source | Example Usage |
|------------|-------|--------|---------------|
| `primary-green` | #23740D | tailwind.config.ts | Background gradients, primary elements |
| `secondry-green` | #1EA495 | tailwind.config.ts | Secondary actions, highlights |
| `primary-blue` | #74FDE7 | tailwind.config.ts | Accent elements, highlights |
| `primary-yellow` | #FFB84A | tailwind.config.ts | Buttons, active states, highlights |
| `secondry-yellow` | #E7EF88 | tailwind.config.ts | Secondary highlights |
| `terron-green` | #78BF78 | tailwind.config.ts | Terron-specific elements |
| `terron-dull-green` | #21291F | tailwind.config.ts | Dark Terron backgrounds |
| `game-light-blue` | #004154 | tailwind.config.ts | Game UI backgrounds |
| `game-dark-blue` | #013343 | tailwind.config.ts | Dark game UI elements |
| `standard-success-green` | #89d005 | Standardized | Success states, notifications, alerts, progress bars |

### Typography

| Class | Font Size | Line Height | Usage | Example |
|-------|-----------|-------------|-------|---------|
| `text-[10px]` | 10px | normal | Small labels | `src/components/clients/Game/Modals/DressUp/Button.tsx:18` |
| `text-xs` | 12px | normal | Small text | `src/components/clients/RadioButton/index.tsx:25` |
| `text-sm` | 14px | normal | Body text | `src/components/clients/Game/UI/Buttons/MetalicButton.tsx:36` |
| `text-base` | 16px | normal | Default text | `src/components/clients/Game/Modals/SettingsModal/Button.tsx:18` |
| `text-lg` | 18px | normal | Large text | `src/components/clients/server/MainFooter/NewsLetter.tsx:53` |
| `text-xl` | 20px | normal | Headings | `src/components/clients/InventoryContainer/Button.tsx:21` |
| `text-2xl` | 24px | normal | Large headings | `src/components/clients/DailyQuest/Guid/index.tsx:28` |

**Font Families:**
- Primary: Comic Neue (ComicSansMS) for Phaser elements
- Default: System fonts via Tailwind defaults

**Text Effects:**
- `.bold` - Black text shadow for emphasis (`src/styles/globals.css:490-492`)
- `.titleBold` - Enhanced text shadow for titles (`src/styles/globals.css:521-523`)

### Radii & Borders

| Class | Value | Usage | Example |
|-------|-------|-------|---------|
| `rounded-lg` | 8px | Standard buttons, cards | `src/components/clients/Game/UI/Buttons/MetalicButton.tsx:31` |
| `rounded-xl` | 12px | Large cards, containers | `src/components/clients/InventoryContainer/index.tsx:66` |
| `rounded-2xl` | 16px | Modals, major containers | `src/components/clients/LeaderBoardContainer/Modal.tsx:122` |
| `rounded-full` | 50% | Circular elements, close buttons | `src/components/clients/LeaderBoardContainer/Modal.tsx:127` |

**Border Patterns:**
- `border-2` - Standard borders (2px)
- `border-[3px]` - Thick borders for emphasis
- `border-black` - Consistent black borders
- `border-primary-yellow` - Accent borders

### Shadows & Focus

| Class | Value | Usage | Example |
|-------|-------|-------|---------|
| `shadow-lg` | 0 10px 15px -3px rgba(0, 0, 0, 0.1) | Elevated elements | `src/components/clients/Game/UI/Buttons/AuthIconButton.tsx:20` |
| `shadow-gray-400` | 0 10px 15px -3px rgba(156, 163, 175, 0.1) | Subtle shadows | `src/components/clients/Game/UI/Buttons/AuthIconButton.tsx:20` |

**Focus States:**
- `focus:outline-none` - Remove default outline
- `focus:ring-0` - Remove focus ring
- Custom focus handling via `active:opacity-80`

### Spacing Scale

| Class | Value | Usage | Example |
|-------|-------|-------|---------|
| `p-2.5` | 10px | Standard padding | `src/components/clients/Game/Modals/DressUp/index.tsx:225` |
| `p-5` | 20px | Large padding | `src/components/clients/LeaderBoardContainer/Modal.tsx:122` |
| `gap-2.5` | 10px | Standard gaps | `src/components/clients/Game/Modals/DressUp/index.tsx:229` |
| `gap-5` | 20px | Large gaps | `src/components/clients/Partnership/PartnershipForm.tsx:211` |

## Standardized UI Elements

### Success/Completion Indicators

#### Checkmark Icon
**MANDATORY**: Use the checkmark image for all completion states.

```tsx
<Image
  alt="checkmark"
  src="/images/game/scenes/gameIcons/checkmark.png"
  width={40}
  height={40}
  className="w-7 xs:w-8 lg:w-9 aspect-square"
/>
```

#### Close/X Icon
**MANDATORY**: Use the crossmark image for all close buttons.

```tsx
<Image
  alt="close"
  src="/images/game/scenes/gameIcons/crossmark.png"
  width={40}
  height={40}
  className="w-8 sm:w-10 aspect-square"
/>
```

#### Standard Success Green
**MANDATORY**: Use `#89d005` for all success states, notifications, alerts, and progress bars.

```tsx
// Alert/Notification Bubbles
<div 
  className="text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
  style={{ backgroundColor: '#89d005' }}
>
  {count}
</div>

// Progress Bars (when 100% complete)
<div className="h-1.5 rounded-full bg-[#89d005]" />

// Success Status Indicators
<div 
  className="text-black px-3 py-1 rounded font-bold text-xs"
  style={{ backgroundColor: '#89d005' }}
>
  Completed ✓
</div>
```

**Text Color Standard:**
- **MANDATORY**: Always use `text-black` for text on `#89d005` backgrounds
- **Rationale**: Provides optimal contrast and readability against the bright green background


## Component Standards (Derived from Existing Components)

### Button Variants

#### Primary Button (Metallic Style)
```tsx
// src/components/clients/Game/UI/Buttons/MetalicButton.tsx
<button
  className="border-2 w-[250px] xs:w-[300px] sm:w-[400px] border-black rounded-lg bg-primary-yellow p-2.5 relative"
>
  <div className="flex w-full h-full rounded-lg justify-center items-center py-3 lg:py-5 text-black text-center text-sm xs:text-base uppercase bg-amber-200">
    <p>{title}</p>
  </div>
</button>
```

#### Secondary Button (Simple Style)
```tsx
// src/components/clients/Game/Modals/DressUp/Button.tsx
<button
  className="w-[80px] xs:w-[100px] sm:w-[110px] text-[10px] min-[320px]:text-xs xs:text-sm sm:text-base h-7 xs:h-8 sm:h-10 uppercase rounded-lg bg-primary-yellow border border-black flex justify-center items-center"
>
  {buttonText}
</button>
```

#### Icon Button
```tsx
// src/components/clients/Game/UI/Buttons/AuthIconButton.tsx
<button
  className="flex w-[250px] xs:w-[300px] 2xl:w-[400px] h-12 md:h-14 items-center bg-white p-2.5 py-3 rounded-full text-black shadow-lg shadow-gray-400"
>
  <div className="pl-5 h-5 md:h-6 flex justify-center">{icon}</div>
  <p className="w-full text-center text-sm md:text-base uppercase">{title}</p>
</button>
```

#### Disabled Button
```tsx
// src/components/clients/InventoryContainer/Button.tsx
<button
  className="border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed active:opacity-80 text-black uppercase text-xl xl:text-2xl w-full h-16 lg:h-20 bg-white rounded-xl"
  disabled={disabled}
>
  {children}
</button>
```

### Input/Form Fields

#### Standard Input
```tsx
// src/components/clients/NewsLetter/index.tsx
<input
  type="email"
  placeholder="Email"
  className="w-full placeholder-yellow-100 text-start px-2.5 p-2.5 rounded-xl border-2 border-black placeholder:text-white/50 outline-none focus:ring-0 text-black text-xs xs:text-sm sm:text-base md:text-lg xl:text-xl bg-white/20"
/>
```

#### Form Input with Validation
```tsx
// src/components/clients/Partnership/PartnershipForm.tsx
<Field
  type="text"
  className="w-full p-2.5 border-2 rounded-xl focus:outline-none focus:border-primary-yellow border-black"
/>
<ErrorMessage
  name="projectName"
  component="div"
  className="text-red-500 text-xs xs:text-sm bold mt-0.5"
/>
```

#### Radio Button
```tsx
// src/components/clients/RadioButton/index.tsx
<input
  type="checkbox"
  className="appearance-none h-3.5 w-3.5 xs:h-4 xs:w-4 lg:h-5 lg:w-5 border border-gray-300 rounded checked:after:-translate-y-0.5 checked:border-transparent focus:outline-none checked:after:content-['✔'] checked:after:text-white checked:after:block checked:after:text-center checked:bg-secondry-green"
/>
```

### Card/Panel Containers

#### Standard Card
```tsx
// src/components/clients/server/MainContainer/FAQCard.tsx
<div className="flex w-full h-[405px] xs:h-[380px] sm:h-[400px] md:h-[350px] lg:h-[550px] 2xl:h-[580px] relative border-4 border-black bg-white/40 rounded-2xl flex-col sm:flex-row lg:flex-col p-5 justify-between items-center gap-5">
  {/* Card content */}
</div>
```

#### Game Container
```tsx
// src/components/clients/InventoryContainer/index.tsx
<div className="flex self-center w-full flex-col relative sm:w-[575px] md:w-[740px] lg:w-[980px] xl:w-full lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[2000px] h-[690px] xs:h-[752px] sm:h-[735px] md:h-[800px] lg:h-[815px] xl:h-[830px] 2xl:h-[840px] bg-black border-t-[2px] min-[400px]:border-2 sm:border-[3px] border-black sm:rounded-xl overflow-hidden">
  {/* Container content */}
</div>
```

### Modal/Drawer Structure

#### **REQUIRED: Standard Game Modal Build Specification**
**MANDATORY:** All in-game modals MUST follow this exact structure for consistency.

```tsx
// Complete modal structure - REQUIRED for all game modals
import CrossMark from "../../../../../public/images/game/scenes/gameIcons/crossmark.png";
import Image from "next/image";

function GameModal() {
  return (
    <div className="absolute w-full h-full z-40 pointer-events-auto flex flex-col justify-center items-center sm:px-2.5 bg-black/60 backdrop-blur-md focus:outline-none">
      <div className="w-full h-full sm:w-[520px] md:w-[700px] lg:w-[900px] sm:h-[calc(100vh-30px)] sm:max-h-[750px] flex flex-col bg-primary-yellow sm:border-2 sm:border-primary-yellow sm:rounded-xl overflow-hidden relative p-2.5 pt-0">
        
        {/* REQUIRED: Header with decorative elements */}
        <div className="w-full flex flex-col relative">
          <div className="flex items-center px-2.5 sm:px-4 py-3 sm:py-4">
            <div className="w-8 sm:w-10"></div>
            <p className="text-2xl font-bold text-black uppercase flex-1 text-center">
              Modal Title
            </p>
            <button
              type="button"
              aria-label="close"
              onClick={handleClose}
              className="z-30 w-8 sm:w-10 aspect-square"
            >
              <Image src={CrossMark} alt="close" width={40} height={40} />
            </button>
          </div>

          {/* REQUIRED: Decorative corner elements */}
          <div className="absolute top-0 left-0 w-full flex justify-between items-center" style={{ paddingLeft: '0px', paddingRight: '0px', paddingTop: '8px' }}>
            <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
            <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
          </div>

          <div className="absolute bottom-0 left-0 w-full flex justify-between items-center" style={{ paddingLeft: '0px', paddingRight: '0px', paddingBottom: '8px' }}>
            <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
            <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
          </div>
        </div>

        {/* REQUIRED: Content area */}
        <div className="flex flex-col w-full h-full bg-black rounded-xl relative gap-2.5 py-2.5 md:py-5 focus:outline-none" style={{ overflow: 'hidden' }}>
          {/* Modal content goes here */}
        </div>
      </div>
    </div>
  );
}
```

#### **Modal Build Requirements (MANDATORY)**

##### **1. Container Structure**
```tsx
// Outer backdrop container
<div className="absolute w-full h-full z-40 pointer-events-auto flex flex-col justify-center items-center sm:px-2.5 bg-black/60 backdrop-blur-md focus:outline-none">

// Inner modal container
<div className="w-full h-full sm:w-[520px] md:w-[700px] lg:w-[900px] sm:h-[calc(100vh-30px)] sm:max-h-[750px] flex flex-col bg-primary-yellow sm:border-2 sm:border-primary-yellow sm:rounded-xl overflow-hidden relative p-2.5 pt-0">
```

##### **2. Header Structure (REQUIRED)**
```tsx
// Header container with decorative elements
<div className="w-full flex flex-col relative">
  <div className="flex items-center px-2.5 sm:px-4 py-3 sm:py-4">
    <div className="w-8 sm:w-10"></div>  {/* REQUIRED: Spacer for centering */}
    <p className="text-2xl font-bold text-black uppercase flex-1 text-center">
      Modal Title
    </p>
    <button
      type="button"
      aria-label="close"
      onClick={handleClose}
      className="z-30 w-8 sm:w-10 aspect-square"
    >
      <Image src={CrossMark} alt="close" width={40} height={40} />
    </button>
  </div>

  {/* REQUIRED: Decorative corner elements */}
  <div className="absolute top-0 left-0 w-full flex justify-between items-center" style={{ paddingLeft: '0px', paddingRight: '0px', paddingTop: '8px' }}>
    <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
    <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
  </div>

  <div className="absolute bottom-0 left-0 w-full flex justify-between items-center" style={{ paddingLeft: '0px', paddingRight: '0px', paddingBottom: '8px' }}>
    <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
    <div className="w-2 aspect-square rounded-full bg-amber-200/70" />
  </div>
</div>
```

##### **3. Content Area (REQUIRED)**
```tsx
// Content container
<div className="flex flex-col w-full h-full bg-black rounded-xl relative gap-2.5 py-2.5 md:py-5 focus:outline-none" style={{ overflow: 'hidden' }}>
  {/* Modal content goes here */}
</div>
```

#### **Header Specifications (MANDATORY)**

##### **Text Styling**
- **Font:** `text-2xl font-bold text-black uppercase`
- **Layout:** `flex-1 text-center` (centered with spacer)
- **No text shadow** (removed for clean appearance)

##### **Header Height**
- **Padding:** `py-3 sm:py-4` (consistent ~70px height)
- **Horizontal padding:** `px-2.5 sm:px-4`

##### **Text Centering**
- **Left spacer:** `<div className="w-8 sm:w-10"></div>` (balances close button)
- **Text container:** `flex-1 text-center` (takes remaining space)
- **Close button:** `w-8 sm:w-10 aspect-square` (fixed width)

#### **Decorative Elements (MANDATORY)**

##### **Corner Elements**
- **Size:** `w-2 aspect-square rounded-full`
- **Color:** `bg-amber-200/70`
- **Positioning:** `absolute top-0` and `absolute bottom-0`
- **Padding:** `paddingTop: '8px'` and `paddingBottom: '8px'`
- **Horizontal:** `paddingLeft: '0px', paddingRight: '0px'`

##### **Layout**
- **Container:** `w-full flex justify-between items-center`
- **Position:** Top and bottom of header container
- **Z-index:** Inherits from parent (no additional z-index needed)

#### **Container Specifications (MANDATORY)**

##### **Outer Container**
- **Background:** `bg-black/60 backdrop-blur-md`
- **Positioning:** `absolute w-full h-full z-40`
- **Layout:** `flex flex-col justify-center items-center`
- **Padding:** `sm:px-2.5`

##### **Inner Container**
- **Background:** `bg-primary-yellow`
- **Border:** `sm:border-2 sm:border-primary-yellow`
- **Border radius:** `sm:rounded-xl`
- **Padding:** `p-2.5 pt-0`
- **Overflow:** `overflow-hidden`

##### **Content Area**
- **Background:** `bg-black`
- **Border radius:** `rounded-xl`
- **Padding:** `py-2.5 md:py-5`
- **Layout:** `flex flex-col w-full h-full`
- **Gap:** `gap-2.5`

#### **Close Button Requirements (MANDATORY)**
- **Image:** Always use `crossmark.png` from `/public/images/game/scenes/gameIcons/`
- **Import Path:** Adjust relative path based on file location:
  - From `src/components/clients/Game/Modals/`: `../../../../../public/images/game/scenes/gameIcons/crossmark.png` (5 levels up)
  - From `src/components/clients/Game/Modals/SettingsModal/`: `../../../../../../public/images/game/scenes/gameIcons/crossmark.png` (6 levels up)
- **Button Classes:** `z-30 w-8 sm:w-10 aspect-square`
- **Image Props:** `width={40} height={40}`
- **Accessibility:** Always include `type="button"`, `aria-label="close"`, and `alt="close"`
- **Positioning:** Place in header section, top-right

#### **Modal Variations**

##### **Settings Modal (Special Case)**
- **Header padding:** `py-1.5 sm:py-2` (smaller for ~70px height)
- **Decorative padding:** `paddingTop: '0px'` and `paddingBottom: '0px'`
- **All other specifications:** Same as standard modal

##### **Legacy Modal (Deprecated)**
```tsx
// OLD - Do not use for new modals
<div className="fixed cursor-pointer top-0 left-0 z-50 w-screen h-[100%] flex flex-col justify-center items-center bg-black/95">
  <div className="bg-white cursor-default relative flex flex-col px-2.5 xs:px-5 gap-5 w-full h-[100%] sm:h-[calc(100%-30px)] sm:max-h-[800px] sm:w-[500px] overflow-hidden sm:rounded-2xl sm:border-4 border-primary-yellow">
    {/* Old structure - deprecated */}
  </div>
</div>
```

### Tabs

#### **REQUIRED: Standard Game Tab System**
**MANDATORY:** All in-game tab systems MUST use the standardized tab styling for consistency.

##### **Main Tab Navigation (Modal Headers)**
```tsx
// Standard tab container for modal headers
<div className="flex w-full overflow-visible items-center min-h-[48px] h-12 text-black rounded-tl-full rounded-tr-full px-2.5 sm:px-5 flex-shrink-0 mt-2.5 sm:mt-3">
  {tabs.map((tab, index) => (
    <React.Fragment key={tab.id}>
      <button
        type="button"
        onClick={handleTabClick}
        className={`relative flex h-full justify-center items-center w-full transition-colors duration-200 ${
          index === 0 ? 'rounded-tl-[20px]' : ''
        } ${
          index === tabs.length - 1 ? 'rounded-tr-[20px]' : ''
        } ${
          activeTab === tab.id
            ? 'bg-primary-yellow text-black !opacity-100'
            : 'bg-white text-black !opacity-100 border border-black'
        }`}
      >
        <p className="text-center w-full text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base uppercase">
          {tab.label}
        </p>
        
        {/* Notification dot for tabs with alerts */}
        {tab.hasNotification && (
          <div className="absolute -top-1 -right-1 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold border-2 border-black bg-red-500 z-50">
            {tab.notificationCount > 99 ? '99+' : tab.notificationCount}
          </div>
        )}
      </button>
      {index < tabs.length - 1 && (
        <div className="w-[1px] h-full bg-black"></div>
      )}
    </React.Fragment>
  ))}
</div>
```

##### **Sub-Tab Navigation (Content Areas)**
```tsx
// Sub-tab container for content areas within modals
<div className="flex w-full overflow-visible items-center min-h-[36px] h-9 text-black rounded-tl-full rounded-tr-full flex-shrink-0">
  {subTabs.map((tab, index) => (
    <React.Fragment key={tab.id}>
      <button
        type="button"
        onClick={handleSubTabClick}
        className={`relative flex h-full justify-center items-center w-full transition-colors duration-200 rounded-tl-[20px] ${
          index === subTabs.length - 1 ? 'rounded-tr-[20px]' : ''
        } ${
          activeSubTab === tab.id
            ? "bg-primary-yellow text-black !opacity-100"
            : "bg-white text-black !opacity-100 border border-black"
        }`}
      >
        <p className="text-center w-full text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base uppercase">
          {tab.label}
        </p>
      </button>
      {index < subTabs.length - 1 && (
        <div className="w-[1px] h-full bg-black"></div>
      )}
    </React.Fragment>
  ))}
</div>
```

#### **Tab System Requirements (MANDATORY)**

##### **Main Tab Container**
- **Container:** `flex w-full overflow-visible items-center min-h-[48px] h-12 text-black rounded-tl-full rounded-tr-full px-2.5 sm:px-5 flex-shrink-0 mt-2.5 sm:mt-3`
- **Height:** `min-h-[48px] h-12` (48px minimum, 48px standard)
- **Padding:** `px-2.5 sm:px-5` (horizontal padding)
- **Margin:** `mt-2.5 sm:mt-3` (top margin for spacing from header)
- **Flex:** `flex-shrink-0` (prevents shrinking)

##### **Sub-Tab Container**
- **Container:** `flex w-full overflow-visible items-center min-h-[36px] h-9 text-black rounded-tl-full rounded-tr-full flex-shrink-0`
- **Height:** `min-h-[36px] h-9` (36px minimum, 36px standard)
- **No padding:** Flush with content edges
- **Flex:** `flex-shrink-0` (prevents shrinking)

##### **Button Classes**
- **Base:** `relative flex h-full justify-center items-center w-full transition-colors duration-200`
- **Rounded Corners:** 
  - First tab: `rounded-tl-[20px]` (20px on all screen sizes)
  - Last tab: `rounded-tr-[20px]` (20px on all screen sizes)
  - Middle tabs: No rounded corners
- **Active State:** `bg-primary-yellow text-black !opacity-100` (no border)
- **Inactive State:** `bg-white text-black !opacity-100 border border-black`

##### **Text Styling**
- **Main Tabs:** `text-center w-full text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base uppercase`
- **Sub-Tabs:** `text-center w-full text-[8px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base uppercase`
- **Responsive:** Scales from 8px on mobile to base (16px) on large screens

##### **Separators**
- **Between tabs:** `w-[1px] h-full bg-black` (1px vertical line)
- **Not on outer edges:** Only between tabs, not before first or after last

##### **Notification Dots**
- **Positioning:** `absolute -top-1 -right-1` (positioned above and to the right)
- **Size:** `min-w-[18px] h-[18px]` (minimum 18px width, 18px height)
- **Styling:** `text-white text-xs rounded-full flex items-center justify-center px-1 font-bold border-2 border-black bg-red-500`
- **Z-index:** `z-50` (ensures visibility above other elements)
- **Text:** `{count > 99 ? '99+' : count}` (caps at 99+)

##### **Tab Content Area**
- **Container:** `flex-1 overflow-y-auto` (takes remaining space, scrollable)
- **Padding:** `px-2.5 xs:px-5 py-5` (standard modal content padding)
- **Gap:** `gap-5` (consistent spacing between content sections)

#### **Tab System Specifications (MANDATORY)**

##### **Height Consistency**
- **Main tabs:** Always 48px (`h-12`)
- **Sub-tabs:** Always 36px (`h-9`)
- **Minimum heights:** `min-h-[48px]` and `min-h-[36px]` prevent size changes

##### **Border Radius**
- **All screen sizes:** Use `rounded-tl-[20px]` and `rounded-tr-[20px]`
- **No responsive changes:** Consistent 20px radius across all breakpoints

##### **Color Scheme**
- **Active tab:** `bg-primary-yellow text-black` (yellow background, black text)
- **Inactive tab:** `bg-white text-black border border-black` (white background, black text, black border)
- **Separators:** `bg-black` (black vertical lines)

##### **Typography Scale**
- **Mobile (default):** `text-[8px]` (8px)
- **Extra small:** `xs:text-[10px]` (10px)
- **Small:** `sm:text-xs` (12px)
- **Medium:** `md:text-sm` (14px)
- **Large:** `lg:text-base` (16px)

##### **Spacing & Layout**
- **Container padding:** `px-2.5 sm:px-5` (10px mobile, 20px desktop)
- **Top margin:** `mt-2.5 sm:mt-3` (10px mobile, 12px desktop)
- **Content padding:** `px-2.5 xs:px-5 py-5` (10px mobile, 20px desktop)
- **Content gap:** `gap-5` (20px between sections)

#### **Legacy Tab Patterns (Deprecated)**

##### **Old Achievement Modal Style (Deprecated)**
```tsx
// OLD - Do not use for new tabs
<div className="flex w-full overflow-visible items-center h-12 text-black rounded-tl-full rounded-tr-full px-2.5 sm:px-5">
  {tabs.map((tab, index) => (
    <button
      className={`relative flex h-full justify-center items-center w-full transition-colors duration-200 ${
        index === 0 ? 'rounded-tl-[20px] sm:rounded-tl-full' : ''
      } ${
        index === tabs.length - 1 ? 'rounded-tr-[20px] sm:rounded-tr-full' : ''
      } ${
        activeTab === tab
          ? 'bg-primary-yellow text-black !opacity-100'
          : 'bg-white text-black !opacity-100 border border-black'
      }`}
    >
      <p className="text-center w-full text-[10px] xs:text-xs sm:text-sm lg:text-base uppercase">
        {tabTitle}
      </p>
    </button>
  ))}
</div>
```

##### **Old Game Tab Style (Deprecated)**
```tsx
// OLD - Do not use for new tabs
<button
  className={`active:opacity-80 disabled:opacity-100 flex-1 text-black text-[10px] xs:text-xs sm:text-lg md:text-xl py-5 text-center border-[2px] lg:border-[3px] uppercase !border-l-0 !border-t-0 border-black ${
    active ? "bg-primary-yellow" : "bg-white"
  } ${isLast ? "!border-r-0" : ""}`}
>
  {label}
</button>
```

##### **Old Terron Quest Style (Deprecated)**
```tsx
// OLD - Do not use for new tabs
<button
  className={`uppercase border-black border-b flex-1 text-center text-black text-[10px] xs:text-sm sm:text-lg lg:text-xl px-1.5 xs:px-2.5 md:px-7.5 lg:px-10 py-2.5 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-70 ${
    activeTab !== value ? "bg-white" : "bg-terron-green"
  }`}
>
  {value}
</button>
```

#### Legacy Tab (Deprecated)
```tsx
// OLD - Do not use for new tabs
<button
  className={`active:opacity-80 disabled:opacity-100 flex-1 text-black text-[10px] xs:text-xs sm:text-lg md:text-xl py-5 text-center border-[2px] lg:border-[3px] uppercase !border-l-0 !border-t-0 border-black ${
    active ? "bg-primary-yellow" : "bg-white"
  } ${isLast ? "!border-r-0" : ""}`}
>
  {label}
</button>
```

#### Game Tab (Deprecated)
```tsx
// OLD - Do not use for new tabs
<button
  className={`uppercase border-black border-b flex-1 text-center text-black text-[10px] xs:text-sm sm:text-lg lg:text-xl px-1.5 xs:px-2.5 md:px-7.5 lg:px-10 py-2.5 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-70 ${
    activeTab !== value ? "bg-white" : "bg-terron-green"
  }`}
>
  {value}
</button>
```

## Layout Patterns

### Common Containers

#### Main Container
```tsx
// src/components/clients/DailyQuest/Guid/index.tsx
<div className="mt-10 w-full h-full self-center flex flex-col justify-center items-center min-[310px]:px-2.5 xs:px-5 2xl:px-[70px] lg:max-w-[1000px] xl:max-w-[1200px] 2xl:max-w-[2200px] gap-14 z-30">
  {/* Content */}
</div>
```

#### Responsive Grid
```tsx
// src/components/clients/Partnership/PartnershipForm.tsx
<div className="grid md:grid-cols-2 gap-4">
  {/* Grid items */}
</div>
```

#### Flex Layout
```tsx
// src/components/clients/CheckRarity/SynchronizedScrollLayout.tsx
<div className="relative w-full h-full">
  <div className="relative w-full h-full overflow-y-auto overflow-x-hidden">
    {/* Scrollable content */}
  </div>
</div>
```

### Spacing Rhythm

- **Section spacing:** `gap-14` (56px) for major sections
- **Component spacing:** `gap-5` (20px) for related components
- **Element spacing:** `gap-2.5` (10px) for closely related elements
- **Padding:** `p-2.5` (10px) for standard padding, `p-5` (20px) for large padding

## Interaction & States

### Hover/Active/Disabled Patterns

#### Button States
```tsx
// Standard pattern across components
className="active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
```

#### Focus States
```tsx
// Input focus
className="focus:outline-none focus:ring-0 focus:border-primary-yellow"
```

#### Loading States
```tsx
// Processing button pattern
className={`${processing ? "opacity-50 cursor-not-allowed" : ""}`}
```

### Accessibility Practices (Observed)

#### ARIA Labels
```tsx
// Consistent aria-label usage
<button aria-label="Close Modal" />
<input aria-label={title} />
```

#### Keyboard Navigation
- `active:opacity-80` for visual feedback on interaction
- `disabled:cursor-not-allowed` for disabled states
- Focus management in modals with backdrop clicks

#### Color Contrast
- High contrast black borders on light backgrounds
- White text on dark backgrounds
- Primary yellow (#FFB84A) provides sufficient contrast on black

## Normalization Recommendations (Evidence-Based)

### Ad-hoc → Preferred Mappings

| Ad-hoc Pattern | Preferred | Count | Examples |
|----------------|-----------|-------|----------|
| `rounded-[10px]` | `rounded-lg` | 15+ | Various components |
| `w-[250px]` | `w-64` | 20+ | Button components |
| `h-[250px]` | `h-64` | 15+ | Card components |
| `text-[10px]` | `text-xs` | 30+ | Small text elements |
| `border-[3px]` | `border-4` | 25+ | Thick borders |

### Justification
- `rounded-lg` (8px) is close to `rounded-[10px]` and provides consistency
- `w-64` (256px) is close to `w-[250px]` and follows Tailwind scale
- `text-xs` (12px) is close to `text-[10px]` and more maintainable
- `border-4` (4px) is close to `border-[3px]` and follows Tailwind scale

## Do / Don't (Guardrails)

### Do
- ✅ Use documented color tokens (`primary-yellow`, `primary-green`, etc.)
- ✅ Follow established border patterns (`border-2`, `border-black`)
- ✅ Use consistent spacing scale (`p-2.5`, `gap-5`, etc.)
- ✅ Apply proper focus states (`active:opacity-80`, `disabled:opacity-50`)
- ✅ Use uppercase for button text and labels
- ✅ Apply text shadows for emphasis (`.bold`, `.titleBold`)
- ✅ Use responsive prefixes (`xs:`, `sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- ✅ **Follow the REQUIRED modal build specification exactly**
- ✅ **Include decorative corner elements in all modals**
- ✅ **Use the three-column header layout for text centering**
- ✅ **Apply consistent header height (~70px) across all modals**
- ✅ **Use `crossmark.png` for all modal close buttons**
- ✅ **Use standardized tab system for all tabbed interfaces**
- ✅ **Apply consistent tab heights (48px for main tabs, 36px for sub-tabs)**
- ✅ **Use 20px border radius for all tab corners (no responsive changes)**
- ✅ **Include proper notification dots with z-50 positioning**
- ✅ **Use consistent typography scale for tab text**

### Don't
- ❌ Add new npm packages for styling
- ❌ Create new color values outside the established palette
- ❌ Use arbitrary values when Tailwind equivalents exist
- ❌ Remove established accessibility patterns
- ❌ Change the core design system without team consensus
- ❌ Use inline styles when Tailwind classes are available
- ❌ **Create modals without decorative corner elements**
- ❌ **Use different header structures for modals**
- ❌ **Skip the spacer div for header text centering**
- ❌ **Use different close button images or styling**
- ❌ **Vary header heights between modals**
- ❌ **Use different tab heights or border radius patterns**
- ❌ **Create custom tab systems instead of using standardized patterns**
- ❌ **Use responsive border radius changes for tabs**
- ❌ **Position notification dots without proper z-index**
- ❌ **Vary typography scales between different tab types**

## Change Review Checklist (for future PRs)

- [ ] No new dependencies added
- [ ] Uses documented color tokens from `tailwind.config.ts`
- [ ] Follows established border patterns (`border-2`, `border-black`)
- [ ] Uses consistent spacing scale (`p-2.5`, `gap-5`)
- [ ] Applies proper focus states (`active:opacity-80`)
- [ ] Includes proper ARIA labels for accessibility
- [ ] Uses responsive prefixes appropriately
- [ ] Follows established component patterns
- [ ] Maintains consistent typography hierarchy
- [ ] Preserves existing accessibility features
- [ ] **Modal builds follow REQUIRED specification exactly**
- [ ] **All modals include decorative corner elements**
- [ ] **Header text is properly centered with spacer div**
- [ ] **Modal headers have consistent ~70px height**
- [ ] **Close buttons use `crossmark.png` image**
- [ ] **Content areas use `bg-black rounded-xl` styling**
- [ ] **Tab systems use standardized height and styling patterns**
- [ ] **Main tabs are 48px height, sub-tabs are 36px height**
- [ ] **All tab corners use 20px border radius consistently**
- [ ] **Notification dots use proper z-50 positioning**
- [ ] **Tab typography follows responsive scale from 8px to 16px**

## Appendix A — Evidence Index

### Configuration Files
- `tailwind.config.ts` - Color tokens, custom utilities
- `src/styles/globals.css` - CSS variables, custom classes, scrollbar styles

### Component Categories
- **Buttons:** `src/components/clients/Game/UI/Buttons/`, `src/components/clients/InventoryContainer/Button.tsx`
- **Modals:** `src/components/clients/LeaderBoardContainer/Modal.tsx`, `src/components/clients/Game/Modals/`
- **Tabs:** `src/components/clients/Tabs/`, `src/components/clients/quests/terron-quest/Tabs/`
- **Forms:** `src/components/clients/Partnership/PartnershipForm.tsx`, `src/components/clients/NewsLetter/`
- **Cards:** `src/components/clients/server/MainContainer/FAQCard.tsx`, `src/components/clients/InventoryContainer/`

### Layout Components
- **Containers:** `src/components/clients/InventoryContainer/index.tsx`, `src/components/clients/DailyQuest/Guid/index.tsx`
- **Scrollable Areas:** `src/components/clients/CheckRarity/SynchronizedScrollLayout.tsx`

## Appendix B — Repository Search Queries

### Utility Pattern Searches
```bash
# Rounded corners
grep -r "rounded-" src/components --include="*.tsx" | wc -l

# Border patterns  
grep -r "border-" src/components --include="*.tsx" | wc -l

# Shadow patterns
grep -r "shadow-" src/components --include="*.tsx" | wc -l

# Background patterns
grep -r "bg-" src/components --include="*.tsx" | wc -l
```

### Component Pattern Searches
```bash
# Button components
find src/components -name "*Button*" -type f

# Modal components
find src/components -name "*Modal*" -type f

# Tab components
find src/components -name "*Tab*" -type f

# Card components
find src/components -name "*Card*" -type f
```

### Configuration Analysis
```bash
# Tailwind config
cat tailwind.config.ts

# Global styles
cat src/styles/globals.css
```

---

*This style guide was generated from analysis of the existing codebase and should be updated as new patterns emerge or existing patterns evolve.*
