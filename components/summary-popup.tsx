'use client';

import React from 'react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Label } from './ui/label';
import { Edit2Icon } from 'lucide-react';
import { Button } from './ui/button';
import PromptFlowStep1Edit from './prompt-flow-step1-edit';
import { useAtom } from 'jotai';
import { showSummaryAtom } from '@/lib/atoms';
import PromptFlowStep2Edit from './prompt-flow-step2-edit';
import PromptFlowStep3Edit from './prompt-flow-step3-edit';

const userProviderInformation = [
  { label: 'Principal Name', value: 'test' },
  { label: 'Email', value: 'test@example.com' },
  { label: 'Role', value: 'Admin' },
  { label: 'Department', value: 'Marketing' },
  { label: 'Location', value: 'New York' },
  { label: 'Phone', value: '+1 555-1234' },
  { label: 'Status', value: 'Active' },
  { label: 'Last Login', value: '2024-06-10' },
];
const selectSourceDocuments = [
  { label: 'Principal Name', value: 'test' },
  { label: 'Email', value: 'test@example.com' },
  { label: 'Phone', value: '+1 555-1234' },
  { label: 'Status', value: 'Active' },
  { label: 'Last Login', value: '2024-06-10' },
];

export default function SummaryPopup() {
  const [open, setOpen] = useAtom(showSummaryAtom);

  return (
    <Dialog open={open} onOpenChange={() => setOpen(false)}>
      <DialogContent className="w-full sm:min-w-[600px] md:min-w-[800px] h-auto max-h-[80vh] overflow-y-auto">
        <DialogTitle>
          <span className="text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Summary</span>
        </DialogTitle>
        <div className="flex items-center space-x-2">
          <Label className="font-semibold text-md ">Select A Prompt</Label>
          <Dialog>
            <DialogTrigger asChild>
              <div className="border rounded-full h-5 w-5 cursor-pointer flex items-center justify-center">
                <Edit2Icon size="12" />
              </div>
            </DialogTrigger>
            <DialogContent className="w-full sm:min-w-[600px] md:min-w-[800px] h-auto max-h-[80vh] overflow-y-auto">
              <PromptFlowStep1Edit />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-2">
          {['marketing', 'sales', 'product'].map((tag) => (
            <div key={tag} className="flex items-center w-fit bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium dark:bg-indigo-900 dark:text-indigo-200">
              {tag}
            </div>
          ))}
        </div>
        <p className="text-sm text-foreground">Create a comprehensive marketing strategy for a new product launch, including target audience analysis</p>
        <div className="flex gap-2">
          {['marketing'].map((tag) => (
            <div key={tag} className="flex items-center w-fit bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full text-xs font-medium dark:bg-indigo-900 dark:text-indigo-200">
              {tag}
            </div>
          ))}
        </div>
        <p className="text-sm text-foreground">Create a comprehensive marketing strategy for a new product launch, including target audience analysis</p>
        <div className="flex items-center space-x-2">
          <Label className="font-semibold text-md ">User Provider Information</Label>
          <Dialog>
            <DialogTrigger asChild>
              <div className="border rounded-full h-5 w-5 cursor-pointer flex items-center justify-center">
                <Edit2Icon size="12" />
              </div>
            </DialogTrigger>
            <DialogContent className="w-full sm:min-w-[600px] md:min-w-[800px] h-auto max-h-[80vh] overflow-y-auto">
              <PromptFlowStep2Edit />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-4 justify-start items-start flex-wrap mb-4">
          {userProviderInformation.map((item) => (
            <div key={item.label} className="min-w-[140px] flex-1 flex flex-col mb-2 sm:mb-0">
              <div className="font-normal text-md">{item.label}</div>
              <div className="text-muted-foreground text-sm">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Label className="font-semibold text-md ">Select Source Documents</Label>
          <Dialog>
            <DialogTrigger asChild>
              <div className="border rounded-full h-5 w-5 cursor-pointer flex items-center justify-center">
                <Edit2Icon size="12" />
              </div>
            </DialogTrigger>
            <DialogContent className="w-full sm:min-w-[600px] md:min-w-[800px] h-auto max-h-[80vh] overflow-y-auto">
              <PromptFlowStep3Edit />
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-4 justify-start items-start flex-wrap mb-4">
          {selectSourceDocuments.map((item) => (
            <div key={item.label} className="min-w-[140px] flex-1 flex flex-col mb-2 sm:mb-0">
              <div className="font-normal text-md">{item.label}</div>
              <div className="text-muted-foreground text-sm">{item.value}</div>
            </div>
          ))}
        </div>
        <Accordion type="single" collapsible className="w-full rounded-2xl bg-muted px-3">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-base cursor-pointer hover:no-underline">Select Source Documents</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="flex gap-4">
                <Label htmlFor="financial-services" className="font-light cursor-pointer">
                  Select A Prompt
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="single" collapsible className="w-full rounded-2xl bg-muted px-3">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-base cursor-pointer hover:no-underline">Add-Ons (Optional)</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="flex gap-4">
                <Label htmlFor="financial-services" className="font-light cursor-pointer">
                  Select A Prompt
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DialogFooter className="mx-4 mt-6">
          <DialogClose asChild>
            <Button className="bg-[#373CA3] text-white">Run Prompt</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
