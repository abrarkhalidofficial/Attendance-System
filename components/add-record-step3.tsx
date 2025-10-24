'use client';

import React, { useState } from 'react';
import { DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScrollContainer from 'react-indiana-drag-scroll';

export default function AddRecordStep3({ setCurrentStep }: { setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  const tabs = ['details', 'video', 'video-highlights', 'qa-videos', 'introduction-video', 'article-quote-card', 'podbook'];
  const [activeTab, setActiveTab] = useState('details');

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col max-w-full">
        <TabsList className="bg-transparent flex-shrink-0 px-6">
          <ScrollContainer hideScrollbars={false} horizontal className="max-full whitespace-nowrap min-[500px]:whitespace-normal max-[500px]:max-w-[300px]" ignoreElements=".tab-trigger">
            <TabsTrigger
              value="details"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Video
            </TabsTrigger>
            <TabsTrigger
              value="video-highlights"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Video Highlights
            </TabsTrigger>
            <TabsTrigger
              value="qa-videos"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Q&A Videos
            </TabsTrigger>
            <TabsTrigger
              value="introduction-video"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Introduction Video
            </TabsTrigger>
            <TabsTrigger
              value="article-quote-card"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Article & Quote Card
            </TabsTrigger>
            <TabsTrigger
              value="podbook"
              className="tab-trigger data-[state=active]:text-base cursor-pointer data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground shadow-none data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-none"
            >
              Podbook
            </TabsTrigger>
          </ScrollContainer>
        </TabsList>
        <hr className="w-full mb-4 flex-shrink-0" />

        <TabsContent value="details" className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">Episode ID</Label>
              <Input placeholder="Enter episode ID" name="episode-id" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Episode Number</Label>
              <Input placeholder="Enter episode number" name="episode-number" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Episode Title</Label>
              <Input placeholder="Enter episode title" name="episode-title" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Date Recorded</Label>
              <Input type="date" name="date-recorded" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Category</Label>
              <Input placeholder="Enter category" name="category" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Short Episode Description</Label>
              <Input placeholder="Enter short description" name="short-description" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Long Episode Description</Label>
              <Input placeholder="Enter long description" name="long-description" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Short and Long-Tail SEO Keywords</Label>
              <Input placeholder="Enter SEO keywords" name="seo-keywords" />
            </div>
            <div className="w-full">
              <Label className="mb-2">All-Asset Folder</Label>
              <Input placeholder="Enter folder path or URL" name="asset-folder" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="video">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">Full Episode Video Title</Label>
              <Input placeholder="Enter video title" name="video-title" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Episode Video Length</Label>
              <Input placeholder="Enter video length" name="video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Episode Video Description</Label>
              <Input placeholder="Enter video description" name="video-description" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Episode Video File</Label>
              <Input placeholder="Enter video file path or URL" name="video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Episode Audio File</Label>
              <Input placeholder="Enter audio file path or URL" name="audio-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Episode YouTube URL</Label>
              <Input placeholder="Enter YouTube URL" name="youtube-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Unedited Full Episode Transcript</Label>
              <Input placeholder="Enter unedited transcript" name="unedited-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Edited Full Episode Transcript</Label>
              <Input placeholder="Enter edited transcript" name="edited-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Provocative Statements</Label>
              <Input placeholder="Enter provocative statements" name="provocative-statements" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Custom Requests</Label>
              <Input placeholder="Enter custom requests" name="custom-requests" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="video-highlights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">Highlight Video Title</Label>
              <Input placeholder="Enter highlight video title" name="highlight-video-title" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Highlight Video Length</Label>
              <Input placeholder="Enter highlight video length" name="highlight-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Highlight Video Description</Label>
              <Input placeholder="Enter highlight video description" name="highlight-video-description" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Highlight Video File</Label>
              <Input placeholder="Enter highlight video file path or URL" name="highlight-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Highlight Video YouTube URL</Label>
              <Input placeholder="Enter highlight YouTube URL" name="highlight-youtube-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Highlight Video Transcript</Label>
              <Input placeholder="Enter highlight video transcript" name="highlight-video-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Highlights Video LinkedIn Post Info</Label>
              <Input placeholder="Enter LinkedIn post info" name="highlight-linkedin-post-info" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="qa-videos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">QAV1 Video Title</Label>
              <Input placeholder="Enter QAV1 video title" name="qav1-video-title" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Video Length</Label>
              <Input placeholder="Enter QAV1 video length" name="qav1-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Video Description</Label>
              <Input placeholder="Enter QAV1 video description" name="qav1-video-description" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Video Quote</Label>
              <Input placeholder="Enter QAV1 video quote" name="qav1-video-quote" type="date" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Video Hashtags</Label>
              <Input placeholder="Enter QAV1 video hashtags" name="qav1-video-hashtags" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Video LinkedIn Post Information</Label>
              <Input placeholder="Enter LinkedIn post information" name="qav1-linkedin-post-info" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Video File</Label>
              <Input placeholder="Enter QAV1 video file path or URL" name="qav1-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 YouTube URL</Label>
              <Input placeholder="Enter QAV1 YouTube URL" name="qav1-youtube-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Video Transcript</Label>
              <Input placeholder="Enter QAV1 video transcript" name="qav1-video-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Article URL</Label>
              <Input placeholder="Enter QAV1 article URL" name="qav1-article-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Article Text</Label>
              <Input placeholder="Enter QAV1 article text" name="qav1-article-text" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 YouTube Short Video File</Label>
              <Input placeholder="Enter YouTube short video file path or URL" name="qav1-youtube-short-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 YouTube Short URL</Label>
              <Input placeholder="Enter YouTube short URL" name="qav1-youtube-short-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 YouTube Short Transcript</Label>
              <Input placeholder="Enter YouTube short transcript" name="qav1-youtube-short-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 LinkedIn Short Video File</Label>
              <Input placeholder="Enter LinkedIn short video file path or URL" name="qav1-linkedin-short-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 LinkedIn Transcript</Label>
              <Input placeholder="Enter LinkedIn transcript" name="qav1-linkedin-transcript" />
            </div>
            <div className="w-full">
              <Label className="mb-2">QAV1 Quote Card</Label>
              <Input placeholder="Enter QAV1 quote card" name="qav1-quote-card" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="introduction-video">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">Introduction Video Title</Label>
              <Input placeholder="Enter introduction video title" name="introduction-video-title" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Introduction Video Length</Label>
              <Input placeholder="Enter introduction video length" name="introduction-video-length" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Introduction Video Description</Label>
              <Input placeholder="Enter introduction video description" name="introduction-video-description" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Introduction Video File</Label>
              <Input placeholder="Enter introduction video file path or URL" name="introduction-video-file" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Introduction Video YouTube URL</Label>
              <Input placeholder="Enter introduction YouTube URL" name="introduction-youtube-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Introduction Video Transcript</Label>
              <Input placeholder="Enter introduction video transcript" name="introduction-video-transcript" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="article-quote-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">Article URL</Label>
              <Input placeholder="Enter article URL" name="article-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Article Text</Label>
              <Input placeholder="Enter article text" name="article-text" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Full Episode Quote Card</Label>
              <Input placeholder="Enter full episode quote card" name="full-episode-quote-card" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="podbook">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(80vh-295px)] overflow-y-auto px-6">
            <div className="w-full">
              <Label className="mb-2">Podbook Interactive Link</Label>
              <Input placeholder="Enter podbook interactive link" name="podbook-interactive-link" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Podbook Website URL</Label>
              <Input placeholder="Enter podbook website URL" name="podbook-website-url" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Podbook Embed Code</Label>
              <Input placeholder="Enter podbook embed code" name="podbook-embed-code" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Podbook Presentation</Label>
              <Input placeholder="Enter podbook presentation" name="podbook-presentation" />
            </div>
            <div className="w-full">
              <Label className="mb-2">Podbook Loom Folder</Label>
              <Input placeholder="Enter podbook loom folder" name="podbook-loom-folder" />
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
