'use client';

import { Input } from './ui/input';
import { DialogClose, DialogDescription, DialogFooter, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';

export default function PromptFlowStep2Edit() {
  return (
    <>
      <DialogTitle className="text-xl sm:text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">User Provided Information</DialogTitle>
      <DialogDescription className="text-foreground">Edit Provide the necessary information</DialogDescription>
      <div className="flex gap-2.5 w-full px-4">
        <div className="w-full mt-4">
          <Label>Principal Name</Label>
          <Input className="mt-2 h-12" type="text" placeholder="Principal Name" />
        </div>
        <div className="w-full mt-4">
          <Label>Work/school</Label>
          <Input className="mt-2 h-12" type="text" placeholder="work/school" />
        </div>
      </div>
      <div className="flex gap-2.5 w-full px-4">
        <div className="w-full mt-4">
          <Label>Start date</Label>
          <Input className="mt-2 h-12" type="date" placeholder="Start date" />
        </div>
        <div className="w-full mt-4">
          <Label>End date</Label>
          <Input className="mt-2 h-12" type="date" placeholder="End date" />
        </div>
      </div>
      <div className="flex gap-2.5 w-full px-4">
        <div className="w-full mt-4">
          <Label>Your Full Name</Label>
          <Input className="mt-2 h-12" type="text" placeholder="Your Full Name" />
        </div>
        <div className="w-full mt-4">
          <Label>Your Position / Class & Roll No.</Label>
          <Input className="mt-2 h-12" type="text" placeholder="Your Position / Class & Roll No." />
        </div>
      </div>
      <div className="px-4">
        <Label className="mt-4">Contact Information</Label>
        <Input className="mt-2 h-12" type="text" placeholder="Contact Information" />
      </div>
      <DialogFooter className="mx-4 mt-4">
        <DialogClose asChild>
          <Button variant="default">Save</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
