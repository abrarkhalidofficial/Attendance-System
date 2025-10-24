import { Button } from './ui/button';
import { DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';

export default function PromptOptimizationDialog() {
  return (
    <div className="flex flex-col gap-4 w-full px-6">
      <DialogTitle>
        <span className="text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Prompt Optimization</span>
      </DialogTitle>

      <div className="flex justify-between items-center">
        <div>Original Prompt:</div>
        <Button variant="default" className="bg-[#373CA3] hover:bg-[#373CA3]/90 text-white">
          <svg width={11} height={13} viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.1789 9.06789C9.81568 9.93681 9.20352 10.6789 8.41948 11.2006C7.63544 11.7224 6.71456 12.0005 5.77278 12C3.13706 12 1 9.866 1 7.23333C1 4.60067 2.00222 3.52389 3.56972 1C6.50672 2.28333 6.50672 6.13333 6.50672 6.13333C6.50672 6.13333 7.47167 4.27678 9.44433 3.38333C10.0762 5.24233 10.9293 7.27306 10.1789 9.06789Z"
              stroke="white"
              strokeWidth={0.916667}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.73622 10.1669C4.92584 10.1669 4.14864 9.84496 3.57562 9.27193C3.00259 8.6989 2.68066 7.92171 2.68066 7.11133"
              stroke="white"
              strokeWidth={0.916667}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Original Prompt
        </Button>
      </div>
      <Textarea placeholder="Enter Your Edit Prompt here:" className="bg-[#F5F5F5] h-[120px]" />
      <Textarea
        placeholder="Optimized Prompt will appear here..."
        className="bg-[#F5F5F5] h-[120px] border-[#373CA3] focus-visible:border-[#373CA3] focus-visible:ring-[#373CA3]/50 focus-visible:ring-[3px] text-[#373CA3] placeholder:text-[#373CA3]"
      />
    </div>
  );
}
