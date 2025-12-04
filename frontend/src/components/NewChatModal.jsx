//frontend\src\components\NewChatModal.jsx
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConnections, setSelectedUser } from '../store/userSlice';

export default function NewChatModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { connections } = useSelector((state) => state.user);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchConnections());
        }
    }, [isOpen, dispatch]);

    const filteredConnections = connections.items.filter((user) =>
        (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelectUser = (user) => {
        dispatch(setSelectedUser(user));
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-4">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                    >
                                        New Message
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search connections..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
                                    />
                                </div>

                                <div className="mt-2 h-64 overflow-y-auto custom-scrollbar space-y-2">
                                    {connections.loading ? (
                                        <div className="text-center py-4 text-gray-500">Loading...</div>
                                    ) : filteredConnections.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            {search ? 'No connections found.' : 'No connections yet.'}
                                        </div>
                                    ) : (
                                        filteredConnections.map((user) => (
                                            <div
                                                key={user._id}
                                                onClick={() => handleSelectUser(user)}
                                                className="flex items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                            >
                                                <img
                                                    src={user.avatar || 'https://via.placeholder.com/40'}
                                                    alt={user.username}
                                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.fullName || user.username}
                                                    </p>
                                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
