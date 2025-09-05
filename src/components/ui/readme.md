# Component Usage Reference

This document explains **all available components**, their **props**, and quick references so you don't need to open the source files.

---

## Button
**Props:**  
- `variant`: `"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"`  
- `size`: `"sm" | "default" | "lg" | "icon"`  
- `asChild?`: `boolean` (render as child element)  
- `disabled?`: `boolean`  
- `className?`: `string`  
- `onClick?`: `(e) => void`

---

## Badge
**Props:**  
- `variant`: `"default" | "secondary" | "destructive" | "outline"`  
- `className?`: `string`

---

## Card
**Exports:**  
`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**Props:**  
- All subcomponents accept `className?`: `string` and native `div` props.

---

## Checkbox
**Props:**  
- `checked?`: `boolean | "indeterminate"`  
- `onCheckedChange?`: `(value: boolean | "indeterminate") => void`  
- `disabled?`: `boolean`  
- `className?`: `string`

---

## Dialog
**Exports:**  
`Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`,  
`DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal`

**Props:**  
- `Dialog`:  
  - `open?`: `boolean` (controlled state)  
  - `onOpenChange?`: `(open: boolean) => void`  
- `DialogTrigger`:  
  - `asChild?`: `boolean` (use with custom trigger like a button or link)  
- `DialogContent`, `DialogHeader`, `DialogFooter`, etc.:  
  - `className?`: `string`

---

## Input
**Props:**  
- `type?`: `"text" | "email" | "password" | "number" | ...`  
- `value?`: `string`  
- `defaultValue?`: `string`  
- `placeholder?`: `string`  
- `disabled?`: `boolean`  
- `readOnly?`: `boolean`  
- `onChange?`: `(e) => void`  
- `className?`: `string`

---

## Textarea
**Props:**  
- `value?`: `string`  
- `defaultValue?`: `string`  
- `rows?`: `number`  
- `placeholder?`: `string`  
- `disabled?`: `boolean`  
- `onChange?`: `(e) => void`  
- `className?`: `string`

---

## InputOTP
**Exports:**  
`InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`

**Props:**  
- `InputOTP`:  
  - `maxLength`: `number` (total digits for OTP)  
  - `onComplete?`: `(code: string) => void`  
  - `className?`: `string`  
  - `containerClassName?`: `string`  
- `InputOTPSlot`:  
  - `index`: `number` (0-based position of the slot)

---

## Progress
**Props:**  
- `value?`: `number` (0–100)  
- `className?`: `string`

---

## Select
**Exports:**  
`Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`,  
`SelectLabel`, `SelectItem`, `SelectSeparator`,  
`SelectScrollUpButton`, `SelectScrollDownButton`

**Props:**  
- `Select`:  
  - `value?`: `string`  
  - `defaultValue?`: `string`  
  - `onValueChange?`: `(value: string) => void`  
- `SelectTrigger`:  
  - `className?`: `string`  
- `SelectContent`:  
  - `position?`: `"popper" | "item-aligned"` *(default: `"popper"`)*  
  - `className?`: `string`  
- `SelectItem`:  
  - `value`: `string` *(required)*  
  - `disabled?`: `boolean`

---

## Skeleton
**Props:**  
- `className?`: `string` *(used to define size and shape using Tailwind classes)*

---

## Summary
- Every component supports a `className` for styling customization.
- Combine these components to build accessible, scalable, and beautiful UIs.
