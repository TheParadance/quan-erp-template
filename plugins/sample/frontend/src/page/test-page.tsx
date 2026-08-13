import { Button, Dialog, DialogContent, DialogTitle, DialogHeader } from "@quan-erp/shared-ui";
import { useState } from 'react';

export function TestPage() {
    const [open, setOpen] = useState(false)
    return (
        <div data-plugin="hoem">
            Aung Aungss frontend testfsfds
            <Button onClick={() => setOpen(true)}>hello this is button test</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>hello this is dialog</DialogTitle>
                    </DialogHeader>
                    hello this is dialog content
                </DialogContent>
            </Dialog>
        </div>
    )
}