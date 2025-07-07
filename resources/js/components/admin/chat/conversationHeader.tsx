// resources/js/Components/Admin/Chat/ConversationHeader.jsx
import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function ConversationHeader({
    conversation,
    availableAgents,
    onAssign,
    onClose
}) {
    const [showAssignMenu, setShowAssignMenu] = useState(false);

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        waiting: 'bg-yellow-100 text-yellow-800',
        closed: 'bg-gray-100 text-gray-800'
    };

    const priorityColors = {
        low: 'bg-green-100 text-green-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-yellow-100 text-yellow-800',
        urgent: 'bg-red-100 text-red-800'
    };

    return (
        <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {conversation.reference_id}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[conversation.status]}`}>
                                {conversation.status}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[conversation.priority]}`}>
                                {conversation.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                                {conversation.message_count} messages
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {conversation.assigned_user ? (
                        <div className="text-sm text-gray-600">
                            Assigned to: <span className="font-medium">{conversation.assigned_user.name}</span>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">Unassigned</div>
                    )}

                    <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Actions
                            <ChevronDownIcon className="ml-1 h-4 w-4" />
                        </Menu.Button>

                        <Transition
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setShowAssignMenu(!showAssignMenu)}
                                                className={`${
                                                    active ? 'bg-gray-100' : ''
                                                } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                                            >
                                                Assign to Agent
                                            </button>
                                        )}
                                    </Menu.Item>

                                    {conversation.status !== 'closed' && (
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={onClose}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } block px-4 py-2 text-sm text-red-700 w-full text-left`}
                                                >
                                                    Close Conversation
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
            </div>

            {showAssignMenu && (
               <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                   <h4 className="text-sm font-medium text-gray-900 mb-2">Assign to Agent</h4>
                   <div className="space-y-2">
                       {availableAgents.map((agent) => (
                           <button
                               key={agent.id}
                               onClick={() => {
                                   onAssign(agent.id);
                                   setShowAssignMenu(false);
                               }}
                               className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                   conversation.assigned_user_id === agent.id
                                       ? 'bg-blue-100 text-blue-800'
                                       : 'bg-white text-gray-700 hover:bg-gray-100'
                               }`}
                           >
                               <div className="flex items-center justify-between">
                                   <span>{agent.name}</span>
                                   <div className="flex items-center space-x-2">
                                       <span className={`px-2 py-1 text-xs rounded-full ${
                                           agent.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                       }`}>
                                           {agent.status}
                                       </span>
                                       <span className="text-xs text-gray-500">{agent.role}</span>
                                   </div>
                               </div>
                           </button>
                       ))}
                   </div>
                   <button
                       onClick={() => setShowAssignMenu(false)}
                       className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                   >
                       Cancel
                   </button>
               </div>
           )}

           {conversation.subject && (
               <div className="mt-2">
                   <p className="text-sm text-gray-600">
                       <span className="font-medium">Subject:</span> {conversation.subject}
                   </p>
               </div>
           )}

           {conversation.tags && conversation.tags.length > 0 && (
               <div className="flex flex-wrap gap-1 mt-2">
                   {conversation.tags.map((tag, index) => (
                       <span
                           key={index}
                           className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded"
                       >
                           {tag}
                       </span>
                   ))}
               </div>
           )}
       </div>
   );
}
