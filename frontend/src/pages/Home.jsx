import React, { useState, useEffect, useRef } from 'react';

function Home() {
    const [notes, setNotes] = useState([]);
    const [content, setContent] = useState('');
    const noteInputRef = useRef(null);

    useEffect(() => {
        // Automatically focus the input when the component mounts
        noteInputRef.current.focus();
        
        const fetchNotes = async () => {
            try {
                const response = await fetch('/api/notes');
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to get messages');
                }
                setNotes(data.notes);
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };

        fetchNotes();
    }, []);

    const handleInputChange = (e) => {
        setContent(e.target.value);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            setNotes([...notes, { content }]);
            setContent('');
            fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({content: content})
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to save note');
                }
            })
            .catch(error => {
                console.error('Failed to post message: ', error);
                setNotes(notes.slice(0, -1));
            });
        }
    };

    const handlePageClick = (e) => {
        if (e.target !== noteInputRef.current) {
            e.preventDefault();
            noteInputRef.current.focus();
        }
    };

    useEffect(() => {
        document.addEventListener('click', handlePageClick);
        return () => {
            document.removeEventListener('click', handlePageClick);
        };
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
                <div className="p-8">
                    <div className="flex justify-center">
                        <svg
                            className="w-10 h-10"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                        >
                            <circle cx="50" cy="50" r="48" fill="black" />
                            <path
                                d="M25 25 L35 25 L50 50 L65 25 L75 25 L75 75 L65 75 L65 40 L50 65 L35 40 L35 75 L25 75 Z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <form
                        id="noteForm"
                        onSubmit={handleFormSubmit}
                        className="mb-6"
                    >
                        <div className="flex items-center border-b border-gray-300 py-2">
                            <input
                                type="text"
                                name="content"
                                ref={noteInputRef}
                                value={content}
                                onChange={handleInputChange}
                                required
                                className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                                placeholder="Type your note and press Enter"
                                autoComplete="off"
                            />
                        </div>
                    </form>
                    <ul className="space-y-2">
                        {notes.map((note, index) => (
                            <li
                                key={index}
                                id={note.id}
                                className="bg-gray-50 rounded p-3 shadow"
                            >
                                {note.content}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Home;
