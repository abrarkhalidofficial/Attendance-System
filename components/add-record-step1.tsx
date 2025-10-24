'use client';

import React from 'react';
import { DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from './upload-file';

export default function AddRecordStep1({ setCurrentStep }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <>
      <hr className="w-full mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(80vh-265px)] gap-6 overflow-y-auto px-6">
        <div className="w-full">
          <Label className="mb-2">Persona</Label>
          <Select>
            <SelectTrigger className="bg-[#F5F5F5] min-h-[42px] w-full dark:bg-muted">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full">
          <Label className="mb-2">Guest Title</Label>
          <Input placeholder="Enter guest title" name="guest-title" />
        </div>
        <div className="w-full">
          <Label className="mb-2">Guest Name</Label>
          <Input placeholder="Enter guest name" name="guest-name" />
        </div>
        <div className="w-full">
          <Label className="mb-2">Guest LinkedIn Profile</Label>
          <Input placeholder="Enter guest linkedin" name="guest-linkedin-profile" />
        </div>
        <div className="w-full">
          <Label className="mb-2">Guest Company</Label>
          <Input placeholder="Enter guest company" name="guest-company" />
        </div>
        <div className="w-full">
          <Label className="mb-2">Industry Vertica</Label>
          <Select>
            <SelectTrigger className="bg-[#F5F5F5] min-h-[42px] w-full dark:bg-muted">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full">
          <Label className="mb-2">Guest Industry</Label>
          <Select>
            <SelectTrigger className="bg-[#F5F5F5] min-h-[42px] w-full dark:bg-muted">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full">
          <Label className="mb-2">Guest&apos;s Tracker</Label>
          <Input placeholder="Enter guest company" name="guest-tracker" />
        </div>
        <div className="w-full">
          <Label className="mb-2">Guest&apos;s Dossier</Label>
          <Input placeholder="Enter guest company" name="guest-dossier" />
        </div>
        <div className="w-[80%]">
          <FileUpload dragDropText="Upload Avatar" />
        </div>
      </div>
      <DialogFooter className="mx-4 mt-4 flex-row justify-end">
        <Button variant="outline">Add another Guest</Button>
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
