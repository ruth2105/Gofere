# Component Usage Guide

Quick reference for using the enhanced UI components with proper accessibility and interactions.

## Button

### Basic Usage
```tsx
import { Button } from '@/components/ui/Button';

// Primary button
<Button variant="primary" size="md">Click me</Button>

// With icons
<Button leftIcon={<Star size={20} />}>Favorite</Button>
<Button rightIcon={<ArrowRight size={16} />}>Continue</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Disabled
<Button disabled>Can't click</Button>
```

### Props
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean - shows spinner, disables button
- `leftIcon`: ReactNode - icon before text
- `rightIcon`: ReactNode - icon after text
- Plus all native button props

### Accessibility Features
- Focus-visible ring (4px)
- aria-busy when loading
- aria-disabled when disabled
- Keyboard activation (Enter/Space)

---

## Card

### Basic Usage
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

// Static card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>Main content here</CardContent>
  <CardFooter>Footer content</CardFooter>
</Card>

// Interactive card (hover effects)
<Card hover interactive>Content</Card>

// Clickable card
<Card onClick={() => alert('Clicked!')}>
  Click me
</Card>

// Semantic article
<Card as="article">News article</Card>
```

### Props
- `hover`: boolean - enables hover effects
- `interactive`: boolean - cursor pointer, enhanced hover
- `onClick`: function - makes card clickable with keyboard support
- `as`: 'div' | 'article' | 'section' - semantic HTML element

### Accessibility Features
- Keyboard navigation (Tab)
- Enter/Space activation when clickable
- Focus-within ring for nested elements
- role="button" when onClick provided
- tabIndex={0} when clickable

---

## Input

### Basic Usage
```tsx
import { Input } from '@/components/ui/Input';

// Basic input
<Input label="Email" type="email" placeholder="you@example.com" />

// With error
<Input label="Password" error="Password is required" />

// With helper text
<Input label="Username" helperText="Choose a unique username" />

// With character counter
<Input label="Bio" maxLength={200} showCharCount />

// With icons
<Input leftIcon={<Search size={16} />} placeholder="Search..." />
<Input rightIcon={<Eye size={16} />} type="password" />

// Success state
<Input label="Email" value="valid@email.com" success />

// Required field
<Input label="Name" required />
```

### Props
- `label`: string - field label
- `error`: string - error message
- `helperText`: string - helper text
- `success`: boolean - success state styling
- `leftIcon`: ReactNode - icon on left
- `rightIcon`: ReactNode - icon on right
- `showCharCount`: boolean - show character counter
- `maxLength`: number - max character limit
- Plus all native input props

### Accessibility Features
- Unique ID with useId
- Label association (htmlFor)
- aria-invalid for errors
- aria-describedby for help text
- Required indicator (*)
- Focus ring (ring-4)
- ARIA live regions for dynamic updates

---

## Select

### Basic Usage
```tsx
import { Select } from '@/components/ui/Select';

const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada', disabled: true },
];

// Basic select
<Select
  label="Country"
  options={options}
  placeholder="Select a country"
/>

// With error
<Select
  label="Field of Study"
  options={options}
  error="Please select a field"
/>

// With helper text
<Select
  label="Degree Level"
  options={options}
  helperText="Choose your target degree level"
/>

// Required field
<Select label="Country" options={options} required />
```

### Props
- `label`: string - field label
- `error`: string - error message
- `helperText`: string - helper text
- `success`: boolean - success state
- `options`: Array<{ value, label, disabled? }>
- `placeholder`: string - placeholder option
- Plus all native select props

### Accessibility Features
- Custom chevron icon (appearance-none)
- Same accessibility features as Input
- Keyboard navigation (Up/Down arrows)

---

## Modal

### Basic Usage
```tsx
import { Modal } from '@/components/ui/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  description="Optional description"
>
  <p>Modal content here</p>
  <Button onClick={() => setIsOpen(false)}>Close</Button>
</Modal>

// Custom size
<Modal isOpen={isOpen} onClose={onClose} size="xl">
  Large modal content
</Modal>

// Prevent overlay close
<Modal
  isOpen={isOpen}
  onClose={onClose}
  closeOnOverlayClick={false}
  closeOnEscape={false}
>
  Important content
</Modal>

// No close button
<Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
  Must use custom close button
</Modal>
```

### Props
- `isOpen`: boolean - modal visibility
- `onClose`: function - close handler
- `title`: string - modal title
- `description`: string - optional description
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

### Accessibility Features
- Focus trap (Tab cycles within modal)
- Escape key closes modal
- Auto-focus on open
- Focus restoration on close
- Body scroll lock
- role="dialog"
- aria-modal="true"
- aria-labelledby and aria-describedby
- Backdrop blur

---

## Badge

### Basic Usage
```tsx
import { Badge } from '@/components/ui/Badge';

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="primary">Primary</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// With dot indicator
<Badge dot variant="success">Online</Badge>

// Interactive (clickable)
<Badge interactive onClick={() => alert('Clicked')}>
  Click me
</Badge>
```

### Props
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean - show dot indicator
- `interactive`: boolean - hover effects
- `onClick`: function - click handler

### Accessibility Features
- Focus ring when interactive
- Proper button semantics when clickable
- Hover feedback

---

## Loading

### Basic Usage
```tsx
import { Loading, Spinner } from '@/components/ui/Loading';

// Basic loading spinner
<Loading />

// With text
<Loading text="Loading data..." />

// Different sizes
<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />
<Loading size="xl" />

// Full screen overlay
<Loading fullScreen text="Processing..." />

// Inline spinner (for buttons, etc.)
<Spinner size={16} />
```

### Props
**Loading:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `text`: string - loading message
- `fullScreen`: boolean - full screen overlay
- `className`: string - custom classes

**Spinner:**
- `size`: number - icon size in pixels
- `className`: string - custom classes

### Accessibility Features
- role="status" or role="alert"
- aria-busy="true"
- aria-live="polite"
- Screen reader text

---

## Skeleton

### Basic Usage
```tsx
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonList,
  SkeletonTable,
  SkeletonProfile 
} from '@/components/ui/Skeleton';

// Basic skeleton
<Skeleton width="60%" height={20} />

// Variants
<Skeleton variant="text" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width="100%" height={200} />

// Animation types
<Skeleton animation="pulse" />
<Skeleton animation="wave" />
<Skeleton animation="none" />

// Prebuilt layouts
<SkeletonCard />
<SkeletonList count={5} />
<SkeletonTable rows={10} columns={4} />
<SkeletonProfile />
```

### Props
**Skeleton:**
- `variant`: 'text' | 'circular' | 'rectangular'
- `width`: string | number
- `height`: string | number
- `animation`: 'pulse' | 'wave' | 'none'

**SkeletonList:**
- `count`: number - number of items

**SkeletonTable:**
- `rows`: number
- `columns`: number

### Accessibility Features
- role="status"
- aria-label="Loading..."
- Screen reader text

---

## Best Practices

### Keyboard Navigation
- Always test Tab order
- Ensure focus indicators are visible
- Use semantic HTML (button, a, etc.)
- Don't remove focus outlines without replacement

### Screen Readers
- Provide labels for icon-only buttons
- Use aria-hidden for decorative icons
- Add helper text for complex interactions
- Use aria-live for dynamic updates

### Visual Feedback
- Hover states for all interactive elements
- Focus states distinct from hover
- Active states for press feedback
- Loading states for async actions

### Forms
- Always provide labels
- Show errors inline
- Use helper text for guidance
- Indicate required fields
- Provide success feedback

### Touch Targets
- Minimum 40px height for buttons
- Adequate spacing between targets
- Test on actual mobile devices
- Consider thumb zones on mobile

---

## Common Patterns

### Form with Validation
```tsx
<form onSubmit={handleSubmit}>
  <Input
    label="Email"
    type="email"
    required
    error={errors.email}
    helperText="We'll never share your email"
  />
  
  <Select
    label="Country"
    options={countries}
    required
    error={errors.country}
  />
  
  <Button type="submit" isLoading={isSubmitting}>
    Submit
  </Button>
</form>
```

### Card Grid with Interactions
```tsx
<div className="grid md:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} hover interactive onClick={() => handleClick(item)}>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>{item.content}</CardContent>
      <CardFooter justify="between">
        <Badge variant="info">{item.category}</Badge>
        <Button variant="ghost" size="sm">View</Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

### Loading States
```tsx
{isLoading ? (
  <SkeletonList count={5} />
) : (
  <div className="space-y-4">
    {items.map(item => (
      <Card key={item.id}>{item.content}</Card>
    ))}
  </div>
)}
```

### Modal Confirmation
```tsx
<Modal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  title="Confirm Delete"
  description="This action cannot be undone."
  size="sm"
>
  <div className="flex gap-4 justify-end">
    <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </div>
</Modal>
```
