import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../ContextAPI/AuthContext';
const API_URL = "http://localhost:3000/api/projects"; 


export default function MyProjectPage() {
    const { user } = useContext(AuthContext); 
    const clientEmail = user?.email; 
    
    const [clientProjects, setClientProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const fetchProjects = useCallback(async () => {
        if (!clientEmail) {
            return [];
        }

        try {
            const res = await fetch(API_URL);
            
            if (!res.ok) {
                throw new Error(`Failed to fetch projects: ${res.statusText}`);
            }
            
            const data = await res.json(); 
            const projectData = Array.isArray(data.projects) ? data.projects : [];
            const filteredProjects = projectData.filter(
                project => project.clientEmail && project.clientEmail.trim() === clientEmail.trim()
            );
            
            return filteredProjects;

        } catch (error) {
            console.error("Error loading projects:", error); 
            throw error; 
        }
    }, [clientEmail]);

    useEffect(() => {
        const loadProjects = async () => {
            if (!clientEmail) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setFetchError(false);

           try {
                const filteredProjects = await fetchProjects();
                setClientProjects(filteredProjects);
            } catch (error) {
                console.error("Error fetching data:", error); 
                setFetchError(true);
                setClientProjects([]);
            }finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [clientEmail, fetchProjects]); 

    const handleAcceptBid = (projectId, acceptedBidId) => {
        const updatedProjects = clientProjects.map(project => {
            if (project.id === projectId) {
                const updatedBids = project.list_of_bid.map(bid => {
                    if (bid.bid_ID === acceptedBidId) {
                        return { ...bid, bid_status: 'accepted' };
                    } 
                    if (bid.bid_status === 'pending') {
                        return { ...bid, bid_status: 'rejected' };
                    }
                    return bid;
                });

                return { 
                    ...project, 
                    list_of_bid: updatedBids,
                    status: 'in_progress'
                };
            }
            return project;
        });

        setClientProjects(updatedProjects);
        
      
        console.log(`Send accepted bid ${acceptedBidId} for ${projectId} to server.`);
    };

    if (!user || (user.role !== 'client' && user.role !== 'moderator')) {
         return (
            <div className="p-8 text-center text-xl font-semibold">
                Unauthorized access.
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-8 text-center text-xl">Loading projects...</div>;
    }
    
    if (fetchError) {
        return (
            <div className="p-8 text-center text-xl text-red-600 font-semibold">
                Error connecting API.
            </div>
        );
    }
    
    if (clientProjects.length === 0) {
        return (
            <div className="p-8 text-center text-xl font-semibold">
                No available projects.
            </div>
        );
    }

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return amount; 
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    };

    return (
        <div className="max-w-7xl mx-auto p-8 font-poppins">
            <h1 className="text-4xl font-bold mb-10 text-gray-800">
                My projects
            </h1>
            
            <hr className="mb-8" />

            {clientProjects.map(project => (
                <div key={project.id} className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
                   
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2> 
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-4 items-center mb-6 text-sm font-medium">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            Budget: {formatCurrency(project.budget)}
                        </span>
                        <span className={`px-3 py-1 rounded-full ${project.status === 'approved' || project.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            Project status: **{project.status.toUpperCase()}**
                        </span>
                    </div>

                    <h3 className="text-xl font-semibold mt-6 mb-4 border-t pt-4">
                        Freelancer proposal ({project.list_of_bid ? project.list_of_bid.length : 0} bids)
                    </h3>

                    {(!project.list_of_bid || project.list_of_bid.length === 0) ? (
                        <p className="italic text-gray-500">No available bid.</p>
                    ) : (
                        <div className="space-y-4">
                            {project.list_of_bid.map(bid => (
                                <div key={bid.bid_ID} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-lg text-gray-700">{bid.freelancer_name}</div>
                                        <div className="text-sm text-gray-500 mb-2">Email: {bid.freelancer_email}</div>
                                        <p className="text-gray-800 line-clamp-2 mb-2">
                                            **Proposal:** {bid.bid_desc}
                                        </p>
                                        <div className="font-semibold text-orange-600">
                                            Proposing price: {formatCurrency(bid.price_offer)}
                                        </div>
                                    </div>
                                    
                                    <div className="ml-4 flex flex-col items-end space-y-2 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            bid.bid_status === 'accepted' ? 'bg-green-200 text-green-800' :
                                            bid.bid_status === 'rejected' ? 'bg-red-200 text-red-800' :
                                            'bg-yellow-200 text-yellow-800'
                                        }`}>
                                            {bid.bid_status.charAt(0).toUpperCase() + bid.bid_status.slice(1)}
                                        </span>

                                        {bid.bid_status === 'pending' && !project.list_of_bid.some(b => b.bid_status === 'accepted') && (
                                            <button
                                                onClick={() => handleAcceptBid(project.id, bid.bid_ID)}
                                                className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md"
                                            >
                                                Accepted bid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}