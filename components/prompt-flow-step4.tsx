'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  createColumnHelper,
} from '@tanstack/react-table';

const ALL_CONTENT_TYPES = [
  'Full Episode Highlight Video',
  'Details Full Episodes(3)',
  'Full Episode Extended Content',
  'Full Episode Introduction Video',
  'Full Episode QA Videos',
  'Full Episode Podbook',
  'Full Episode Full Case Study',
  'Full Episode One Page Case Study',
  'Full Episode Other Case Study',
  'Full Episode ICP Advice',
];

const INITIAL_SELECTION = ['Full Episode Introduction Video', 'Full Episode QA Videos'];

export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

const dataVoc: Payment[] = [
  { id: 'voc1', amount: 100, status: 'success', email: 'voc1@example.com111' },
  { id: 'voc2', amount: 200, status: 'processing', email: 'voc2@example.com' },
  { id: 'voc3', amount: 300, status: 'failed', email: 'voc3@example.comsdsd' },
];

const dataVob: Payment[] = [
  { id: 'vob1', amount: 400, status: 'success', email: 'vob1@example.com' },
  { id: 'vob2', amount: 500, status: 'processing', email: 'vob2@example.com' },
  { id: 'vob3', amount: 600, status: 'failed', email: 'vob3@example.comwewe' },
];

const dataVom: Payment[] = [
  { id: 'vom1', amount: 700, status: 'success', email: 'vom1@example.com' },
  { id: 'vom2', amount: 800, status: 'processing', email: 'vom2@example.com' },
  { id: 'vom3', amount: 900, status: 'failed', email: 'vom3@example.com' },
];

const columnHelper = createColumnHelper<Payment>();

const columns = [
  columnHelper.accessor('id', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('amount', {
    header: 'Amount',
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <span
        className={`capitalize px-2 py-1 rounded-full text-xs ${
          info.getValue() === 'success' ? 'bg-green-100 text-green-800' : info.getValue() === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
];

export default function PromptFlowStep4({ setCurrentStep }: { currentStep: number; setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(INITIAL_SELECTION);
  const [selectedFiltersBI, setSelectedFiltersBI] = useState<string[]>(INITIAL_SELECTION);

  const handleCheck = useCallback((type: string, checked: boolean) => {
    setSelectedFilters((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)));
  }, []);

  const handleCheckBI = useCallback((type: string, checked: boolean) => {
    setSelectedFiltersBI((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)));
  }, []);

  const filterButtonText = useMemo(() => {
    if (selectedFilters.length === 0) return '';
    if (selectedFilters.length === 1) return selectedFilters[0];
    return selectedFilters.slice(0, 2).join(', ') + (selectedFilters.length > 2 ? ` +${selectedFilters.length - 2} more` : '');
  }, [selectedFilters]);

  const filterButtonTextBI = useMemo(() => {
    if (selectedFiltersBI.length === 0) return '';
    if (selectedFiltersBI.length === 1) return selectedFiltersBI[0];
    return selectedFiltersBI.slice(0, 2).join(', ') + (selectedFiltersBI.length > 2 ? ` +${selectedFiltersBI.length - 2} more` : '');
  }, [selectedFiltersBI]);

  return (
    <>
      <Separator className="mt-8 mb-4" />
      <div className="text-sm font-medium px-4">
        Source Document: Please select a search method for desired document:{' '}
        <Link href="#" className="text-primary cursor-pointer ml-1">
          Learn more about search type
        </Link>
      </div>

      <div className="relative flex-1 px-4 mt-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Search Prompts" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 min-h-11" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Label htmlFor="ai-search">AI Search</Label>
          <Switch id="ai-search" />
        </div>
      </div>

      <Tabs className="px-4 mt-3" defaultValue="voc">
        <TabsList className="bg-[#EBECF6] h-[45px] rounded-lg">
          {['voc', 'vob', 'vom'].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-[#373CA3] text-[12px] font-normal data-[state=active]:text-white px-4 rounded-lg transition">
              {tab.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="voc" className="mt-4">
          <div className="flex gap-3">
            <Popover open={open1} onOpenChange={setOpen1}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex text-[10px] items-center justify-between text-left mb-3 rounded-full"
                  style={{
                    minWidth: '200px',
                    width: 'auto',
                  }}
                >
                  Filter By Category |<span className="text-[10px] font-normal text-primary truncate"> {filterButtonText}</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 p-4 space-y-4">
                <div className="font-semibold text-gray-900 border-b pb-2">Content Type</div>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {ALL_CONTENT_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox checked={selectedFilters.includes(type)} onCheckedChange={(checked) => handleCheck(type, !!checked)} />
                      <span className="text-sm text-gray-700">{type}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={open2} onOpenChange={setOpen2}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex text-[10px] items-center justify-between text-left mb-3 rounded-full"
                  style={{
                    minWidth: '200px',
                    width: 'auto',
                  }}
                >
                  Buyer Intelligence<span className="text-[10px] font-normal text-primary truncate"> {filterButtonTextBI}</span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-80 p-4 space-y-4">
                <div className="font-semibold text-gray-900 border-b pb-2">Content Type</div>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {ALL_CONTENT_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox checked={selectedFiltersBI.includes(type)} onCheckedChange={(checked) => handleCheckBI(type, !!checked)} />
                      <span className="text-sm text-gray-700">{type}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <DataTablePrompt filters={selectedFilters} data={dataVoc} />
        </TabsContent>

        <TabsContent value="vob" className="mt-4">
          <DataTablePrompt data={dataVob} />
        </TabsContent>

        <TabsContent value="vom" className="mt-4">
          <DataTablePrompt data={dataVom} />
        </TabsContent>
      </Tabs>

      <DialogFooter className="mx-4 mt-6">
        <Button className="font-normal" onClick={() => setCurrentStep(5)} variant="outline">
          Skip
        </Button>
        <Button onClick={() => setCurrentStep(5)} className=" font-normal">
          Next
        </Button>
      </DialogFooter>
    </>
  );
}

export function DataTablePrompt({ filters, data }: { filters?: string[]; data: Payment[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const filteredData = useMemo(() => {
    if (!filters?.length) return data;
    return data.filter((item) => filters.includes(item.id));
  }, [filters, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
