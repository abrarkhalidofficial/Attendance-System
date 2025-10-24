'use client';

import { useState } from 'react';
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

import PromptFlowStep1 from './prompt-flow-step1';
import PromptFlowStep3 from './prompt-flow-step3';

import PromptFlowStep4 from './prompt-flow-step4';
import PromptFlowStep5 from './prompt-flow-step5';
import PromptFlowStep2 from './prompt-flow-step2';

const STEPS = [1, 2, 3, 4, 5];

function StepsIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex justify-center items-center">
      <div className="flex items-center justify-between px-4 py-2 w-[280px] sm:w-[350px]">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep ? 'bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 text-white' : step < currentStep ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
            </div>
            {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${step < currentStep ? 'bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    name: 'Select a Prompt',
    Component: PromptFlowStep1,
  },
  {
    name: 'User Provided Information',
    Component: PromptFlowStep2,
  },
  {
    name: 'Customize Prompt',
    Component: PromptFlowStep3,
  },
  {
    name: 'Select Context Documents',
    Component: PromptFlowStep4,
  },
  {
    name: 'Add-Ons',
    Component: PromptFlowStep5,
  },
];

export default function PromptLibrary() {
  const [currentStep, setCurrentStep] = useState(1);

  const Step = steps[currentStep - 1]?.Component;

  return (
    <div className="flex flex-col gap-2 w-full">
      <DialogHeader className="px-4">
        <DialogTitle className="text-xl sm:text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Prompt Library</DialogTitle>
        <DialogDescription className="text-foreground">{steps[currentStep - 1]?.name}</DialogDescription>
      </DialogHeader>
      <StepsIndicator currentStep={currentStep} />
      <Step currentStep={currentStep} setCurrentStep={setCurrentStep} />
    </div>
  );
}
