'use client';

import { DialogClose, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useAtom } from 'jotai';
import { showSummaryAtom } from '@/lib/atoms';

export default function PromptFlowStep5() {
  const [, setShowSummary] = useAtom(showSummaryAtom);

  return (
    <>
      <div className="flex flex-col gap-4 w-full px-6">
        <Accordion type="single" collapsible className="w-full border rounded-2xl px-4" defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-base cursor-pointer hover:no-underline">Audience Department</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="flex gap-4">
                <Checkbox id="enable-audience-dept" />
                <Label htmlFor="enable-audience-dept" className="font-light cursor-pointer">
                  Enable Audience Department
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="manufacturing" />
                <Label htmlFor="manufacturing" className="font-light cursor-pointer">
                  Manufacturing
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="technology-info-media" />
                <Label htmlFor="technology-info-media" className="font-light cursor-pointer">
                  Technology, Information & Media
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="government-administration" />
                <Label htmlFor="government-administration" className="font-light cursor-pointer">
                  Government Administration
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="financial-services" />
                <Label htmlFor="financial-services" className="font-light cursor-pointer">
                  Financial Services
                </Label>
              </div>
              <Input placeholder="Add Custom Department" className="w-full bg-[#F5F5F5] focus-visible:ring-[1px]" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible className="w-full border rounded-2xl px-4">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-base cursor-pointer hover:no-underline">Audience Titles</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="flex gap-4">
                <Checkbox id="enable-audience-dept" />
                <Label htmlFor="enable-audience-dept" className="font-light cursor-pointer">
                  Enable Audience Department
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="manufacturing" />
                <Label htmlFor="manufacturing" className="font-light cursor-pointer">
                  Manufacturing
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="technology-info-media" />
                <Label htmlFor="technology-info-media" className="font-light cursor-pointer">
                  Technology, Information & Media
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="government-administration" />
                <Label htmlFor="government-administration" className="font-light cursor-pointer">
                  Government Administration
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="financial-services" />
                <Label htmlFor="financial-services" className="font-light cursor-pointer">
                  Financial Services
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="single" collapsible className="w-full border rounded-2xl px-4">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-base cursor-pointer hover:no-underline">Audience Tones</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="flex gap-4">
                <Checkbox id="enable-audience-dept" />
                <Label htmlFor="enable-audience-dept" className="font-light cursor-pointer">
                  Enable Audience Department
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="manufacturing" />
                <Label htmlFor="manufacturing" className="font-light cursor-pointer">
                  Manufacturing
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="technology-info-media" />
                <Label htmlFor="technology-info-media" className="font-light cursor-pointer">
                  Technology, Information & Media
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="government-administration" />
                <Label htmlFor="government-administration" className="font-light cursor-pointer">
                  Government Administration
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="financial-services" />
                <Label htmlFor="financial-services" className="font-light cursor-pointer">
                  Financial Services
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Accordion type="single" collapsible className="w-full border rounded-2xl px-4">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-bold text-base cursor-pointer hover:no-underline">Dos & Don&apos;ts:</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="flex gap-4">
                <Checkbox id="enable-audience-dept" />
                <Label htmlFor="enable-audience-dept" className="font-light cursor-pointer">
                  Enable Audience Department
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="manufacturing" />
                <Label htmlFor="manufacturing" className="font-light cursor-pointer">
                  Manufacturing
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="technology-info-media" />
                <Label htmlFor="technology-info-media" className="font-light cursor-pointer">
                  Technology, Information & Media
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="government-administration" />
                <Label htmlFor="government-administration" className="font-light cursor-pointer">
                  Government Administration
                </Label>
              </div>
              <div className="flex gap-4">
                <Checkbox id="financial-services" />
                <Label htmlFor="financial-services" className="font-light cursor-pointer">
                  Financial Services
                </Label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <DialogFooter className="mx-4 mt-6">
        <Button
          className="font-normal"
          onClick={() => {
            setShowSummary(true);
          }}
          variant="outline"
        >
          Skip
        </Button>
        <DialogClose asChild>
          <Button
            onClick={() => {
              setShowSummary(true);
            }}
            className="font-normal"
          >
            Next
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
