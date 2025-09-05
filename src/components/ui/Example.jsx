
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
  Textarea,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Progress,
  Skeleton,
  Checkbox,
  // OTP
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  // Select
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  // If you also export: DialogPortal, DialogOverlay — demo below shows custom compose too
} from "./index";

// A tiny helper layout for section headings
function Section({ title, description, children }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function Examples() {
  return (
    <div className="p-6 space-y-10 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Component Gallery</h1>

      <ButtonsDemo />
      <CardsDemo />
      <BadgesDemo />
      <InputsDemo />
      <SelectDemo />
      <CheckboxDemo />
      <OTPDemo />
      <TextareasDemo />
      <DialogsDemo />
      <ProgressDemo />
      <SkeletonDemo />
    </div>
  );
}

/* -------------------------- Buttons: variants/sizes ------------------------- */

function ButtonsDemo() {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Section
      title="Button"
      description="Variants, sizes, disabled, asChild links, icon size, full-width, and loading."
    >
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="destructive" className="bg-red-500 border-2  border-red-700">Default</Button>

        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <Button size="default">Default</Button>
          <Button size="lg" variant="outline">
            Large
          </Button>
          <Button size="icon" aria-label="Star">
            {/* example icon placeholder (no external lib): */}
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.25l-7.19-.61L12 2 9.19 8.64 2 9.25l5.46 4.72L5.82 21z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled</p>
        <div className="flex flex-wrap gap-2">
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
        </div>
      </div>

      {/* Loading (simple pattern) */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Loading state</p>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => setIsSaving(false), 1500);
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <SpinnerDot />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      {/* Full width & block usage */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Block / Full width</p>
        <Button className="w-full">Continue</Button>
      </div>

      {/* asChild (render as an anchor) */}
      <div className="space-y-2">
        <p className="text-sm font-medium">asChild (render as a link)</p>
        <Button asChild variant="link">
          <a href="https://example.com" target="_blank" rel="noreferrer">
            External Link
          </a>
        </Button>
      </div>
    </Section>
  );
}

// Minimal spinner without extra deps
function SpinnerDot() {
  return (
    <span
      aria-hidden
      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.125em]"
    />
  );
}

/* --------------------------------- Cards ---------------------------------- */

function CardsDemo() {
  return (
    <Section
      title="Card"
      description="Card with header, description, content, and footer actions."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
            <CardDescription>Use this to group content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cards keep layouts tidy and scannable.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button>Confirm</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Inline form inside a card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Full name" />
            <Input placeholder="Email address" type="email" />
            <Textarea placeholder="Short bio…" />
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Badge>Draft</Badge>
            <div className="flex gap-2">
              <Button variant="outline">Preview</Button>
              <Button>Save</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Section>
  );
}

/* --------------------------------- Badge ---------------------------------- */

function BadgesDemo() {
  return (
    <Section
      title="Badge"
      description="Status pills and small inline labels."
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </Section>
  );
}

/* --------------------------------- Input ---------------------------------- */

function InputsDemo() {
  const [value, setValue] = useState("");

  return (
    <Section
      title="Input"
      description="Text, email, password, with icons, disabled, and controlled."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm">Basic</p>
          <Input placeholder="Search…" />
        </div>

        <div className="space-y-2">
          <p className="text-sm">Types</p>
          <div className="space-y-2">
            <Input type="email" placeholder="name@example.com" />
            <Input type="password" placeholder="••••••••" />
            <Input type="number" placeholder="42" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">With left icon (adornment)</p>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              <svg
                className="h-4 w-4 opacity-60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M21 21l-4.3-4.3" strokeWidth="2" />
              </svg>
            </span>
            <Input className="pl-8" placeholder="Find something…" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">Disabled + Readonly</p>
          <div className="space-y-2">
            <Input disabled placeholder="Disabled field" />
            <Input readOnly defaultValue="Read only value" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm">Controlled</p>
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type and mirror below…"
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={() => setValue("")}
              disabled={!value}
            >
              Clear
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Current: <span className="font-medium">{value || "—"}</span>
          </p>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------- Textarea -------------------------------- */

function TextareasDemo() {
  const [bio, setBio] = useState("I love clean UI.");
  return (
    <Section title="Textarea" description="Basic, disabled, and controlled.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm">Basic</p>
          <Textarea placeholder="Write something…" />
        </div>

        <div className="space-y-2">
          <p className="text-sm">Disabled</p>
          <Textarea disabled placeholder="Can't type here" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <p className="text-sm">Controlled with character count</p>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="max-w-xl"
          />
          <p className="text-xs text-muted-foreground">
            {bio.length} characters
          </p>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------- Dialogs --------------------------------- */

function DialogsDemo() {
  const [open, setOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);

  // Show a dialog programmatically (controlled) after mount, once
  useEffect(() => {
    const id = setTimeout(() => setAutoOpen(true), 250);
    return () => clearTimeout(id);
  }, []);

  return (
    <Section
      title="Dialog"
      description="Trigger-driven & fully controlled usage, with footer actions and close button."
    >
      {/* Uncontrolled via trigger */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Trigger-driven</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Short modal</DialogTitle>
              <DialogDescription>
                Use dialogs for focused tasks or confirmations.
              </DialogDescription>
            </DialogHeader>
            <div className="text-sm">
              Content goes here. You can put inputs, text, anything.
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
              <Button>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Controlled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Controlled (open/onOpenChange)</p>
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Open controlled dialog</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Force close
          </Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Controlled dialog</DialogTitle>
              <DialogDescription>
                Manage visibility with state to coordinate complex flows.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programmatic show-on-mount example */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Programmatic (on mount)</p>
        <Dialog open={autoOpen} onOpenChange={setAutoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome 👋</DialogTitle>
              <DialogDescription>
                This opened automatically after mount.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Got it</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <p className="text-xs text-muted-foreground">
          (Auto-opens once after ~250ms for demo)
        </p>
      </div>
    </Section>
  );
}

/* -------------------------------- Progress -------------------------------- */

function ProgressDemo() {
  const [value, setValue] = useState(25);
  const cycle = () => setValue((v) => (v >= 100 ? 0 : v + 25));

  // fake streaming progress
  const [stream, setStream] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setStream((v) => (v >= 100 ? 0 : v + 5)),
      300
    );
    return () => clearInterval(id);
  }, []);

  return (
    <Section title="Progress" description="Determinate progress examples.">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">Static values</p>
          <div className="flex flex-col gap-3 max-w-sm">
            <Progress value={0} />
            <Progress value={33} />
            <Progress value={66} />
            <Progress value={100} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">Interactive</p>
          <div className="flex items-center gap-3 max-w-sm">
            <Progress value={value} className="flex-1" />
            <Button variant="outline" onClick={cycle}>
              Next
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm">Streaming (simulated)</p>
          <div className="flex items-center gap-3 max-w-sm">
            <Progress value={stream} className="flex-1" />
            <span className="text-xs tabular-nums w-10 text-right">
              {stream}%
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------- Skeleton -------------------------------- */

function SkeletonDemo() {
  return (
    <Section
      title="Skeleton"
      description="Use to hint layout while content loads."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Text lines */}
        <div className="space-y-2">
          <p className="text-sm">Text block</p>
          <div className="space-y-2 max-w-md">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* Media card skeleton */}
        <div className="space-y-2">
          <p className="text-sm">Card placeholder</p>
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="space-y-2 w-full max-w-xs">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>

        {/* Avatar + text */}
        <div className="space-y-2">
          <p className="text-sm">Profile row</p>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 w-48">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function OTPDemo() {
    const [otp, setOtp] = React.useState("");
    const [resendLeft, setResendLeft] = React.useState(0);
  
    React.useEffect(() => {
      if (resendLeft <= 0) return;
      const id = setInterval(() => setResendLeft((s) => s - 1), 1000);
      return () => clearInterval(id);
    }, [resendLeft]);
  
    const handleComplete = (value) => setOtp(value);
    const handleResend = () => setResendLeft(30);
  
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-medium">OTP Verification</h2>
  
        {/* 6-digit OTP with a visual separator after 3 digits */}
        <InputOTP maxLength={6} onComplete={handleComplete}>
          <InputOTPGroup className="gap-2">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
  
          <InputOTPSeparator />
  
          <InputOTPGroup className="gap-2">
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
  
        <div className="text-sm text-muted-foreground">
          Entered: <span className="font-medium">{otp || "—"}</span>
        </div>
  
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLeft > 0}
            className="text-sm underline disabled:opacity-50 disabled:no-underline"
          >
            {resendLeft > 0 ? `Resend in ${resendLeft}s` : "Resend code"}
          </button>
  
          <button
            type="button"
            disabled={otp.length !== 6}
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => alert(`OTP: ${otp}`)}
          >
            Verify
          </button>
        </div>
      </section>
    );
  }
  
  /* ------------------------------ SELECT DEMO -------------------------------- */
  
  function SelectDemo() {
    const [value, setValue] = React.useState("");
  
    // make enough items to show scrolling (so scroll buttons appear)
    const tropical = [
      "mango",
      "banana",
      "pineapple",
      "papaya",
      "guava",
      "lychee",
      "dragonfruit",
      "passionfruit",
      "jackfruit",
    ];
  
    const berries = [
      "strawberry",
      "blueberry",
      "raspberry",
      "blackberry",
      "cranberry",
      "gooseberry",
    ];
  
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Select</h2>
  
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Choose a fruit" />
          </SelectTrigger>
  
          <SelectContent className="max-h-60">
            {/* Optional scroll buttons (visible when overflow) */}
            <SelectScrollUpButton className="py-1 text-xs">Scroll up</SelectScrollUpButton>
  
            <SelectGroup>
              <SelectLabel>Tropical</SelectLabel>
              {tropical.map((f) => (
                <SelectItem key={f} value={f}>
                  {titleCase(f)}
                </SelectItem>
              ))}
            </SelectGroup>
  
            <SelectSeparator />
  
            <SelectGroup>
              <SelectLabel>Berries</SelectLabel>
              {berries.map((f) => (
                <SelectItem key={f} value={f}>
                  {titleCase(f)}
                </SelectItem>
              ))}
              <SelectItem value="grapes" disabled>
                Grapes (unavailable)
              </SelectItem>
            </SelectGroup>
  
            <SelectScrollDownButton className="py-1 text-xs">Scroll down</SelectScrollDownButton>
          </SelectContent>
        </Select>
  
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setValue("")}
          >
            Clear
          </button>
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            disabled={!value}
            onClick={() => alert(`Selected: ${value}`)}
          >
            Submit
          </button>
        </div>
  
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium">{value || "—"}</span>
        </p>
      </section>
    );
  }
  
  function titleCase(s) {
    return s[0].toUpperCase() + s.slice(1);
  }
  
  /* ----------------------------- CHECKBOX DEMO ------------------------------- */
  
  function CheckboxDemo() {
    const [all, setAll] = React.useState(false);
    const [items, setItems] = React.useState({
      news: true,
      product: false,
      offers: false,
    });
  
    const total = Object.keys(items).length;
    const checkedCount = Object.values(items).filter(Boolean).length;
    const isIndeterminate = checkedCount > 0 && checkedCount < total;
    const masterState = isIndeterminate ? "indeterminate" : all;
  
    React.useEffect(() => {
      setAll(checkedCount === total);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkedCount, total]);
  
    const toggleAll = (next) => {
      const val = next === "indeterminate" ? true : !!next;
      setAll(val);
      setItems({ news: val, product: val, offers: val });
    };
  
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Checkbox</h2>
  
        {/* Master checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox id="all" checked={masterState} onCheckedChange={toggleAll} />
          <label htmlFor="all" className="text-sm cursor-pointer">
            Select all
          </label>
        </div>
  
        {/* Children */}
        <div className="ml-6 space-y-2">
          {([
            ["news", "Newsletters"],
            ["product", "Product updates"],
            ["offers", "Special offers"],
          ]).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={items[key]}
                onCheckedChange={(v) =>
                  setItems((s) => ({ ...s, [key]: !!v }))
                }
              />
              <label htmlFor={key} className="text-sm cursor-pointer">
                {label}
              </label>
            </div>
          ))}
        </div>
  
        <div className="text-sm text-muted-foreground">
          Selected: {checkedCount}/{total}
        </div>
      </section>
    );
  }