import { Button } from './ui/button';
import { DialogClose, DialogFooter, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import FileUpload from './upload-file';

export default function ContextDocumentDialog() {
  return (
    <div className="flex flex-col gap-4 w-full px-6">
      <DialogTitle>
        <span className="text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Select your context documents</span>
      </DialogTitle>

      <hr className="border-t border-gray-300" />

      <div className="flex justify-between items-center text-black dark:text-white ">
        <div className="font-medium">Source Document: Search for and select context documents.</div>
        <div className="flex items-center gap-2">
          <Label className="cursor-pointer text-[#8E8F91]" htmlFor="hide">
            Hide
          </Label>
          <Switch id="hide" className="data-[state=checked]:bg-[#373CA3] h-[20px]" />
        </div>
      </div>
      <Tabs defaultValue="account">
        <TabsList className="bg-[#EBECF6] h-[45px] dark:bg-muted">
          <TabsTrigger value="account" className="data-[state=active]:bg-[#373CA3] dark:data-[state=active]:bg-[#373CA3] data-[state=active]:text-white cursor-pointer px-4 ">
            AI Search
          </TabsTrigger>
          <TabsTrigger value="password" className="data-[state=active]:bg-[#373CA3] dark:data-[state=active]:bg-[#373CA3] data-[state=active]:text-white cursor-pointer px-4 ">
            Manual Search
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account"></TabsContent>
        <TabsContent value="password"></TabsContent>
      </Tabs>

      <div className="font-medium flex items-center gap-2">
        <div className="font-medium flex items-center gap-2">
          <svg width={7} height={7} viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.6603 6.75124L0.668471 0.176162L7.0078 0.349918L3.6603 6.75124Z" fill="currentColor" />
          </svg>
          Source Documents
        </div>

        <div className="bg-[#EBECF6] rounded-lg p-1 px-4 text-[#373CA3]">2 docs</div>
      </div>

      <FileUpload />

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
