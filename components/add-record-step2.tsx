'use client';

import React from 'react';
import { DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';

export default function AddRecordStep2({ setCurrentStep }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <>
      <hr className="w-full mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-fit max-h-[calc(100%-380px)] overflow-y-auto px-6">
        <div className="w-full">
          <Label className="mb-2">Unedited Prep Call Video</Label>
          <Input placeholder="Enter url here" name="prep-call-video" />
        </div>
        <div className="w-full">
          <Label className="mb-2">Unedited Prep Call Transcript</Label>
          <Input placeholder="Enter url here" name="prep-call-transcript" />
        </div>
        <div className="w-full">
          <Label className="mb-2">Discussion Guide</Label>
          <Input placeholder="Enter discussion guide" name="discussion-guide" />
        </div>
      </div>
      <DialogFooter className="mx-4 mt-4">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentStep((s) => s - 1);
          }}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            setCurrentStep((s) => s + 1);
          }}
        >
          Next
        </Button>
      </DialogFooter>
    </>
  );
}
