'use client';

import { useState } from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import AddRecordStep1 from './add-record-step1';
import AddRecordStep2 from './add-record-step2';
import AddRecordStep3 from './add-record-step3';
import AddRecordStep4 from './add-record-step4';
import AddRecordStep5 from './add-record-step5';

const STEPS = [1, 2, 3, 4, 5];

function StepsIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex justify-center items-center mb-4">
      <div className="flex items-center justify-between px-4 py-2 w-[280px] sm:w-[350px]">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 text-white'
                    : step < currentStep
                    ? 'bg-indigo-100 dark:bg-gray-400  text-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-500 dark:text-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
            </div>
            {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${step < currentStep ? 'bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400' : 'bg-gray-200 dark:bg-gray-500'}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AddRecordDialog() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="flex flex-col gap-2 w-full">
      <DialogHeader className="px-4">
        <DialogTitle className="text-xl sm:text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Create Record</DialogTitle>
        <DialogDescription className="text-foreground font-bold">
          {currentStep === 1 && 'Guest'}
          {currentStep === 2 && 'Prep Call'}
          {currentStep === 3 && 'Full Episode'}
          {currentStep === 4 && 'Reports'}
          {currentStep === 5 && 'Special Projects'}
        </DialogDescription>
      </DialogHeader>

      <StepsIndicator currentStep={currentStep} />
      {currentStep === 1 && <AddRecordStep1 setCurrentStep={setCurrentStep} />}
      {currentStep === 2 && <AddRecordStep2 setCurrentStep={setCurrentStep} />}
      {currentStep === 3 && <AddRecordStep3 setCurrentStep={setCurrentStep} />}
      {currentStep === 4 && <AddRecordStep4 setCurrentStep={setCurrentStep} />}
      {currentStep === 5 && <AddRecordStep5 setCurrentStep={setCurrentStep} />}
    </div>
  );
}
