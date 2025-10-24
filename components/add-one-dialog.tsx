import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DialogClose, DialogFooter, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export default function AddOneDialog() {
  return (
    <div className="flex flex-col gap-4 w-full px-6">
      <DialogTitle className="mb-1">
        <span className="text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Add-Ons</span>
      </DialogTitle>

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

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-[#373CA3] hover:bg-[#373CA3]/90">
          Next
        </Button>
      </DialogFooter>
    </div>
  );
}
