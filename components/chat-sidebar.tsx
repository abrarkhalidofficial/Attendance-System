import * as React from 'react';

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import ChatSidebarEntry from './chat-sidebar-entry';
import { SidebarContent } from '@/components/ui/sidebar';

const recent = ['Hello Simple Greeting', 'Catering Objects in Form', 'Extract Data to Text.', 'JSON Mapper creado.', 'Improve Pic Positivity', 'Shariah Advisor Proposal', 'Islamic Finance Chatbot'];

export function ChatSidebar() {
  return (
    <SidebarContent>
      <SidebarGroup className="pb-0">
        <SidebarMenu>
          <SidebarMenuItem className="mb-1">
            <SidebarMenuButton className="cursor-pointer" tooltip="New Chat">
              <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.57202 11.8246C7.51 11.8246 8.47266 11.874 9.41064 11.8246C10.941 11.7506 11.6322 11.0594 11.7556 9.55374C11.8296 8.8626 11.805 8.14677 11.8296 7.45563C11.8543 7.11006 11.9284 6.78917 12.348 6.7398C12.7676 6.71512 12.9404 6.96196 12.9651 7.33221C12.9898 8.44297 13.1132 9.57842 12.7923 10.6398C12.3727 11.9974 11.3606 12.812 9.90431 12.9601C7.6581 13.1822 5.38721 13.1822 3.14099 12.9601C1.33909 12.7873 0.129589 11.5531 0.0555382 9.75121C-0.0185127 7.6531 -0.0185127 5.55499 0.0555382 3.48156C0.129589 1.53155 1.28972 0.371424 3.26441 0.0999039C4.07897 -0.0235142 4.89353 -0.0235143 5.70809 0.0505367C6.0043 0.0752203 6.25113 0.223322 6.27582 0.593577C6.3005 1.0132 6.07835 1.23535 5.70809 1.26004C5.01695 1.3094 4.30113 1.28472 3.60998 1.3094C2.0796 1.38345 1.33909 2.04991 1.21567 3.55561C1.06757 5.57967 1.06757 7.62841 1.24035 9.67716C1.36377 11.0101 2.00555 11.6765 3.36315 11.7753C4.42454 11.8493 5.48594 11.7999 6.57202 11.7999C6.57202 11.7999 6.57202 11.7999 6.57202 11.8246Z"
                  fill="currentColor"
                />
                <path
                  d="M3.75235 9.94017C2.88843 10.1623 2.66627 9.79206 2.74032 8.90345C2.86374 7.49649 3.25868 6.28699 4.32008 5.29964C5.65299 4.06546 6.86249 2.73254 8.17073 1.47368C9.25681 0.387597 10.4663 0.338229 11.429 1.25152C12.3669 2.14014 12.3176 3.42368 11.2315 4.53445C9.8739 5.91673 8.49161 7.24965 7.13401 8.63193C6.2454 9.52054 5.10995 9.94017 3.75235 9.94017Z"
                  fill="currentColor"
                />
                <path
                  d="M4.60953 8.40469C4.11585 8.5281 4.0418 8.25659 4.11585 7.86165C4.23927 7.19519 4.48611 6.62746 4.97978 6.13379C6.36206 4.80088 7.69498 3.41859 9.07726 2.08568C9.54625 1.61669 10.0399 1.22175 10.657 1.81416C11.2988 2.45593 10.9285 2.97429 10.4102 3.49264C9.05258 4.85024 7.69498 6.20784 6.33738 7.56544C5.84371 8.03443 5.2513 8.25658 4.60953 8.40469Z"
                  fill="currentColor"
                  opacity={0.5}
                />
              </svg>
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-pointer" tooltip="Search">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14.0439 14.0439L11.5777 11.5774M11.1478 2.44932C10.0739 1.54492 8.68743 1 7.17361 1C3.76401 1 1 3.76432 1 7.17427C1 10.5842 3.76401 13.3486 7.17361 13.3486C10.5832 13.3486 13.3472 10.5842 13.3472 7.17427C13.3472 6.31758 13.1727 5.50156 12.8574 4.75992"
                  stroke="currentColor"
                  strokeWidth="1.48226"
                  strokeLinecap="round"
                />
              </svg>
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="pt-0 in-data-[state=collapsed]:hidden">
        <SidebarGroupLabel className="cursor-pointer">
          <div className="flex items-center gap-2">Chats</div>
        </SidebarGroupLabel>
        <SidebarMenu>
          {recent.map((chat) => (
            <ChatSidebarEntry key={chat} chat={chat} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}

export default ChatSidebar;
