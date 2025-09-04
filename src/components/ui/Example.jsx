import React from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Textarea, Modal } from './index.js'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buttons & Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button isLoading>Loading</Button>
            <Button full>Full width</Button>
          </div>
          <div className="flex gap-2">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Form</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Part number" />
          <Textarea placeholder="Description..." />
          <div className="flex gap-3">
            <Button onClick={() => setOpen(true)}>Open Modal</Button>
          </div>
        </CardContent>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Upload Part">
        <p className="text-sm text-gray-600">Drop your STEP/PDF files here.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button>Upload</Button>
        </div>
      </Modal>

    </div>
  )
}
