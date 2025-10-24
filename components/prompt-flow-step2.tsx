'use client';

import { Input } from './ui/input';
import { DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';

export default function PromptFlowStep2({ setCurrentStep }: { currentStep: number; setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <>
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
        <Button className="font-normal" onClick={() => setCurrentStep(3)} variant="outline">
          Cancel
        </Button>

        <Button className="font-normal" onClick={() => setCurrentStep(3)}>
          Next
        </Button>
      </DialogFooter>
    </>
  );
}
