'use client';

import React, { useState } from 'react';
import { DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollContainer from 'react-indiana-drag-scroll';

export default function AddRecordStep4({ setCurrentStep }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  const tabs = ['icp-advice-report', 'sql-analysis-report', 'challenge-questions'];
  const [activeTab, setActiveTab] = useState('icp-advice-report');

  const handleNext = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    } else {
      setCurrentStep((s) => s - 1);
    }
  };

  const currentIndex = tabs.indexOf(activeTab);
  const isLastTab = currentIndex === tabs.length - 1;
  const isFirstTab = currentIndex === 0;
  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="icp-advice-report" className="flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent flex-shrink-0 px-6">
          <ScrollContainer hideScrollbars={false} horizontal className="max-full whitespace-nowrap min-[500px]:whitespace-normal max-[500px]:max-w-[300px]" ignoreElements=".tab-trigger">
            <TabsTrigger
              value="icp-advice-report"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              ICP Advice Report
            </TabsTrigger>
            <TabsTrigger
              value="sql-analysis-report"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              SQL Analysis Report
            </TabsTrigger>
            <TabsTrigger
              value="challenge-questions"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Challenge Questions
            </TabsTrigger>
          </ScrollContainer>
        </TabsList>
        <hr className="w-full mb-4 flex-shrink-0" />

        <TabsContent value="icp-advice-report" className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">ICP Advice Post-Podcast Video File</Label>
              <Input placeholder="Enter video file path or URL" name="icp-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">ICP Advice Post-Podcast Video Length</Label>
              <Input placeholder="Enter video length" name="icp-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">ICP Advice Post-Podcast Video&apos;s Transcript</Label>
              <Input placeholder="Enter video transcript" name="icp-video-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">ICP Advice Report</Label>
              <Input placeholder="Enter ICP advice report" name="icp-advice-report" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="sql-analysis-report">
          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(80vh-295px)] overflow-y-auto  gap-6 px-6">
            <div className="w-full">
              <Label className="mb-2">SQL Analysis Post-Podcast Video File</Label>
              <Input placeholder="Enter video file path or URL" name="sql-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">SQL Analysis Post-Podcast Video Length</Label>
              <Input placeholder="Enter video length" name="sql-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">SQL Analysis Post-Podcast Video Transcript</Label>
              <Input placeholder="Enter video transcript" name="sql-video-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">SQL Analysis Report</Label>
              <Input placeholder="Enter SQL analysis report" name="sql-analysis-report" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="challenge-questions">
          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(80vh-295px)] overflow-y-auto  gap-6 px-6">
            <div className="w-full">
              <Label className="mb-2">Challenge Questions Prep Call Video File</Label>
              <Input placeholder="Enter video file path or URL" name="challenge-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Challenge Questions Prep Call Video Length</Label>
              <Input placeholder="Enter video length" name="challenge-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Challenge Questions Prep Call Video Transcript</Label>
              <Input placeholder="Enter video transcript" name="challenge-video-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Challenge Questions Report</Label>
              <Input placeholder="Enter challenge questions report" name="challenge-questions-report" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mx-4 mt-4 flex-shrink-0 flex-row justify-end">
        <Button variant="outline" onClick={handlePrevious}>
          {isFirstTab ? 'Previous Step' : 'Previous Tab'}
        </Button>
        <Button onClick={handleNext}>{isLastTab ? 'Next Step' : 'Next Tab'}</Button>
      </DialogFooter>
    </div>
  );
}
