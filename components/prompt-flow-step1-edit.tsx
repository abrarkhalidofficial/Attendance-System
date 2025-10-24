'use client';
import { Search, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { DialogClose, DialogDescription, DialogFooter, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

type Department = 'Marketing' | 'Sales' | 'Product';
type PromptType = 'SingleStage' | 'Multistage';
interface Prompt {
  id: number;
  department: Department;
  text: string;
  type: PromptType;
}

const FILTERABLE_DEPARTMENTS: Department[] = ['Marketing', 'Sales', 'Product'];

const MOCK_PROMPTS: Prompt[] = [
  { id: 1, department: 'Marketing', text: 'Create a social campaign for a new coffee brand.', type: 'SingleStage' },
  { id: 2, department: 'Sales', text: 'Write a cold email for SaaS customers.', type: 'SingleStage' },
  { id: 3, department: 'Product', text: 'Plan metrics for a new feature launch.', type: 'SingleStage' },
  { id: 4, department: 'Marketing', text: 'Write a 3-step campaign for a new service.', type: 'Multistage' },
  { id: 5, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'Multistage' },
  { id: 6, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'SingleStage' },
  { id: 7, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'SingleStage' },
  { id: 8, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'Multistage' },
  { id: 9, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'SingleStage' },
  { id: 10, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'SingleStage' },
  { id: 11, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'Multistage' },
  { id: 12, department: 'Sales', text: 'Develop a 3-part onboarding script.', type: 'SingleStage' },
];

export default function PromptFlowStep1Edit() {
  const [activeTab, setActiveTab] = useState<PromptType>('SingleStage');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);

  const toggleDepartment = useCallback((dept: Department) => {
    setSelectedDepartments((prev) => (prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]));
  }, []);

  const removeDepartment = useCallback((dept: Department) => setSelectedDepartments((prev) => prev.filter((d) => d !== dept)), []);

  const filteredPrompts = useMemo(() => {
    const departmentsToFilter = selectedDepartments.length > 0 ? selectedDepartments : FILTERABLE_DEPARTMENTS;
    return MOCK_PROMPTS.filter((p) => p.type === activeTab && departmentsToFilter.includes(p.department) && p.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, activeTab, selectedDepartments]);
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null);

  function DepartmentBadge({ name, onRemove }: { name: string; onRemove: () => void }) {
    return (
      <div className="flex items-center bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-full text-xs font-medium dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-100">
        {name}
        <button onClick={onRemove} className="ml-2 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  function DepartmentDropdown({ toggleDepartment }: { toggleDepartment: (d: Department) => void }) {
    const [currentValue, setCurrentValue] = useState<string>('');

    const handleSelectChange = (value: string) => {
      toggleDepartment(value as Department);
      setCurrentValue('');
    };

    return (
      <div className="relative w-full sm:w-56">
        <Select value={currentValue} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Departments</SelectLabel>
              {FILTERABLE_DEPARTMENTS.map((dept) => (
                <SelectItem
                  key={dept}
                  value={dept}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDepartment(dept);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{dept}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }

  function PromptItem({ prompt, isSelected, onSelect }: { prompt: Prompt; isSelected: boolean; onSelect: (id: number) => void }) {
    return (
      <div
        onClick={() => onSelect(prompt.id)}
        className={`flex items-start m-2 p-2 mb-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isSelected ? 'bg-indigo-50 dark:bg-indigo-900' : 'hover:bg-indigo-50 dark:hover:bg-[#373CA310]'
        }`}
      >
        <Checkbox checked={isSelected} onChange={() => onSelect(prompt.id)} />
        <div className="ml-4 flex-1">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-200 mb-1">{prompt.department}</div>
          <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{prompt.text}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DialogTitle className="text-xl sm:text-3xl bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent">Prompt Library</DialogTitle>
      <DialogDescription className="text-foreground">Edit A Prompt</DialogDescription>
      <div className="flex flex-col sm:flex-row px-4 gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search Prompts" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <DepartmentDropdown toggleDepartment={toggleDepartment} />
      </div>
      <div className="flex flex-wrap gap-2 px-4 min-h-[32px]">
        {selectedDepartments.length > 0 ? (
          selectedDepartments.map((dept) => <DepartmentBadge key={dept} name={dept} onRemove={() => removeDepartment(dept)} />)
        ) : (
          <p className="text-gray-500 text-sm">Showing all departments.</p>
        )}
      </div>
      <div className="w-full px-4">
        <Tabs defaultValue="single">
          <TabsList>
            <TabsTrigger value="single" onClick={() => setActiveTab('SingleStage')} className={activeTab === 'SingleStage' ? 'text-indigo-600 border-b-2 font-semibold' : ''}>
              Single Stage Prompts ({MOCK_PROMPTS.filter((p) => p.type === 'SingleStage').length})
            </TabsTrigger>
            <TabsTrigger value="multi" onClick={() => setActiveTab('Multistage')} className={activeTab === 'Multistage' ? 'text-indigo-600 border-b-2 font-semibold ' : ''}>
              Multistage Prompts ({MOCK_PROMPTS.filter((p) => p.type === 'Multistage').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="max-h-[30vh] overflow-y-auto ">
        {filteredPrompts.length > 0 ? (
          filteredPrompts.map((p) => <PromptItem key={p.id} prompt={p} isSelected={selectedPromptId === p.id} onSelect={(id) => setSelectedPromptId((prev) => (prev === id ? null : id))} />)
        ) : (
          <p className="text-center text-gray-500 py-10">No prompts found matching your filters.</p>
        )}
      </div>
      <DialogFooter className="mx-4 mt-4">
        <DialogClose asChild>
          <Button variant="default">Save</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
