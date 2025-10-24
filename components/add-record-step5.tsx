'use client';

import React, { useState } from 'react';
import { DialogFooter, DialogClose } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollContainer from 'react-indiana-drag-scroll';

export default function AddRecordStep5({ setCurrentStep }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  const tabs = ['full-case-study', 'one-page-case-study', 'ebook', 'multi-guest-challenge-report'];
  const [activeTab, setActiveTab] = useState('full-case-study');

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
        <TabsList className="bg-transparent flex-shrink-0 px-6">
          <ScrollContainer hideScrollbars={false} horizontal className="max-full whitespace-nowrap min-[500px]:whitespace-normal max-[500px]:max-w-[300px]" ignoreElements=".tab-trigger">
            <TabsTrigger
              value="full-case-study"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Full Case Study
            </TabsTrigger>
            <TabsTrigger
              value="one-page-case-study"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              One-Page Case Study
            </TabsTrigger>
            <TabsTrigger
              value="ebook"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              ebook
            </TabsTrigger>
            <TabsTrigger
              value="multi-guest-challenge-report"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Multi-Guest Challenge Report
            </TabsTrigger>
          </ScrollContainer>
        </TabsList>
        <hr className="w-full mb-4 flex-shrink-0" />

        <TabsContent value="full-case-study">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">Full Case Study Interactive Link</Label>
              <Input placeholder="Enter interactive link" name="full-case-study-interactive-link" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Case Study Website URL</Label>
              <Input placeholder="Enter website URL" name="full-case-study-website-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Case Study Embed Code</Label>
              <Input placeholder="Enter embed code" name="full-case-study-embed-code" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Case Study Text</Label>
              <Input placeholder="Enter case study text" name="full-case-study-text" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Case Study LinkedIn Post Information</Label>
              <Input placeholder="Enter LinkedIn post information" name="full-case-study-linkedin-post" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Problem Section Video File</Label>
              <Input placeholder="Enter video file path or URL" name="problem-section-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Problem Section Video Length</Label>
              <Input placeholder="Enter video length" name="problem-section-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Problem Section Video Transcript</Label>
              <Input placeholder="Enter video transcript" name="problem-section-video-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Solution Section Video Length</Label>
              <Input placeholder="Enter video length" name="solution-section-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Solution Section Video Transcript</Label>
              <Input placeholder="Enter video transcript" name="solution-section-video-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Results Section Video File</Label>
              <Input placeholder="Enter video file path or URL" name="results-section-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Results Section Video Length</Label>
              <Input placeholder="Enter video length" name="results-section-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Results Section Video Transcript</Label>
              <Input placeholder="Enter video transcript" name="results-section-video-transcript" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="one-page-case-study">
          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(80vh-295px)] overflow-y-auto gap-6 px-6">
            <div className="w-full">
              <Label className="mb-2">One Page Case Study Interactive Link</Label>
              <Input placeholder="Enter interactive link" name="one-page-case-study-interactive-link" />
            </div>
            <div className="w-full">
              <Label className="mb-2">One Page Study Website URL</Label>
              <Input placeholder="Enter website URL" name="one-page-study-website-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">One Page Study Embed Code</Label>
              <Input placeholder="Enter embed code" name="one-page-study-embed-code" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="ebook">
          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(80vh-295px)] overflow-y-auto gap-6 px-6">
            <div className="w-full">
              <Label className="mb-2">eBook Title</Label>
              <Input placeholder="Enter eBook title" name="ebook-title" />
            </div>
            <div className="w-full">
              <Label className="mb-2">eBook Interactive Link</Label>
              <Input placeholder="Enter interactive link" name="ebook-interactive-link" />
            </div>
            <div className="w-full">
              <Label className="mb-2">eBook Website URL</Label>
              <Input placeholder="Enter website URL" name="ebook-website-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">eBook Embed Code</Label>
              <Input placeholder="Enter embed code" name="ebook-embed-code" />
            </div>
            <div className="w-full">
              <Label className="mb-2">eBook Text</Label>
              <Input placeholder="Enter eBook text" name="ebook-text" />
            </div>
            <div className="w-full">
              <Label className="mb-2">eBook LinkedIn Post Information</Label>
              <Input placeholder="Enter LinkedIn post information" name="ebook-linkedin-post" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="multi-guest-challenge-report">
          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[calc(80vh-295px)] overflow-y-auto gap-6 px-6">
            <div className="w-full">
              <Label className="mb-2">Multi-Guest Challenge Report Title</Label>
              <Input placeholder="Enter report title" name="multi-guest-challenge-report-title" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Multi-Guest Challenge Report Interactive Link</Label>
              <Input placeholder="Enter interactive link" name="multi-guest-challenge-report-interactive-link" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Multi-Guest Challenge Report Website URL</Label>
              <Input placeholder="Enter website URL" name="multi-guest-challenge-report-website-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Multi-Guest Challenge Report Embed Code</Label>
              <Input placeholder="Enter embed code" name="multi-guest-challenge-report-embed-code" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Multi-Guest Challenge Report Text</Label>
              <Input placeholder="Enter report text" name="multi-guest-challenge-report-text" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Multi-Guest Challenge Report LinkedIn Post</Label>
              <Input placeholder="Enter LinkedIn post information" name="multi-guest-challenge-report-linkedin-post" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter className="mx-4 mt-4 flex-shrink-0 flex-row justify-end">
        <Button variant="outline" onClick={handlePrevious}>
          {isFirstTab ? 'Previous Step' : 'Previous Tab'}
        </Button>

        {isLastTab ? (
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        ) : (
          <Button onClick={handleNext}>Next Tab</Button>
        )}
      </DialogFooter>
    </div>
  );
}
