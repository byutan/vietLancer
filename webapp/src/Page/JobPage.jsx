
import { useState, useMemo, useEffect, useCallback } from "react";
import ProjectCard from "../Components/project-card-jobpage";
import ProjectCardModalJobPage from "../Components/project-card-modal-jobpage";
import Footer from "../Components/Footer";
import { Search } from "lucide-react";

const IT_CATEGORIES = [
    "Web development",
    "Mobile development",
    "Embedded Engineering",
    "UI/UX Design",
    "Quality Assurance",
    "Project Management",
    "DevOps Engineering",
    "Digital Security",
    "Other",
];

const WORK_FORM_OPTIONS = [
    "Offline",
    "Online",
    "Hybrid",
    "Other",
];

const PAYMENT_METHOD_OPTIONS = [
    "Per Hour",
    "Per Month",
    "Per Project",
    "Other",
];

const SALARY_RANGE_OPTIONS = [
    "Under 1.000.000 VND",
    "1.000.000 - 10.000.000 VND",
    "Above 10.000.000 VND",
    "Other",
];

export default function JobPage() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    // Fetch projects from API
    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3000/api/projects");
            const data = await res.json();
            if (data.success) setProjects(data.projects);
        } catch (err) {
            // Optionally handle error
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedWorkForm, setSelectedWorkForm] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [selectedSalaryRange, setSelectedSalaryRange] = useState(null);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            if (project.status !== "approved") return false;
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch =
                (project.title && project.title.toLowerCase().includes(lowerSearch)) ||
                (project.description && project.description.toLowerCase().includes(lowerSearch)) ||
                (typeof project.budget === "number" && project.budget.toString().includes(lowerSearch)) ||
                (project.deadline && project.deadline.toLowerCase().includes(lowerSearch)) ||
                (project.category && project.category.toLowerCase().includes(lowerSearch));
            const matchesCategory = !selectedCategory || (project.category && project.category.toLowerCase() === selectedCategory.toLowerCase());
            const matchesWorkForm = !selectedWorkForm || (project.workForm && project.workForm === selectedWorkForm);
            const matchesPaymentMethod = !selectedPaymentMethod || (project.paymentMethod && (
                project.paymentMethod === selectedPaymentMethod ||
                (project.paymentMethod.replace(/_/g, ' ').toLowerCase() === selectedPaymentMethod.toLowerCase())
            ));
            let matchesSalaryRange = true;
            if (selectedSalaryRange) {
                if (typeof project.budget === 'number') {
                    if (selectedSalaryRange === 'Under 1.000.000 VND') {
                        matchesSalaryRange = project.budget < 1000000;
                    } else if (selectedSalaryRange === '1.000.000 - 10.000.000 VND') {
                        matchesSalaryRange = project.budget >= 1000000 && project.budget <= 10000000;
                    } else if (selectedSalaryRange === 'Above 10.000.000 VND') {
                        matchesSalaryRange = project.budget > 10000000;
                    } else {
                        matchesSalaryRange = true;
                    }
                } else {
                    matchesSalaryRange = true;
                }
            }
            return matchesSearch && matchesCategory && matchesWorkForm && matchesPaymentMethod && matchesSalaryRange;
        });
    }, [projects, searchTerm, selectedCategory, selectedWorkForm, selectedPaymentMethod, selectedSalaryRange]);

    const FilterCheckbox = ({ name, checked, onChange }) => (
        <label className="flex items-center text-sm text-gray-700 mb-2 hover:bg-gray-200 rounded px-2 py-1 transition-colors duration-150">
            <input type="checkbox" className="mr-2 rounded" checked={checked} onChange={onChange} />
            {name}
        </label>
    );

    return (
        <div className="font-poppins flex flex-col min-h-screen">
            <div className="flex-grow flex">
                <aside className="w-1/4 p-6 bg-gray-50 border-r border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">Search & Filter</h2>
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search
                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
                    <nav>
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">Category</h3>
                        <FilterCheckbox
                            name="All"
                            checked={selectedCategory === null}
                            onChange={() => setSelectedCategory(null)}
                        />
                        {IT_CATEGORIES.map((category) => (
                            <FilterCheckbox
                                key={category}
                                name={category}
                                checked={selectedCategory === category}
                                onChange={() => setSelectedCategory(category)}
                            />
                        ))}
                    </nav>
                    <nav className="mt-6">
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">Work Form</h3>
                        <FilterCheckbox
                            name="All"
                            checked={selectedWorkForm === null}
                            onChange={() => setSelectedWorkForm(null)}
                        />
                        {WORK_FORM_OPTIONS.map((form) => (
                            <FilterCheckbox
                                key={form}
                                name={form}
                                checked={selectedWorkForm === form}
                                onChange={() => setSelectedWorkForm(form)}
                            />
                        ))}
                    </nav>
                    <nav className="mt-6">
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">Payment Method</h3>
                        <FilterCheckbox
                            name="All"
                            checked={selectedPaymentMethod === null}
                            onChange={() => setSelectedPaymentMethod(null)}
                        />
                        {PAYMENT_METHOD_OPTIONS.map((method) => (
                            <FilterCheckbox
                                key={method}
                                name={method}
                                checked={selectedPaymentMethod === method}
                                onChange={() => setSelectedPaymentMethod(method)}
                            />
                        ))}
                    </nav>
                    <nav className="mt-6">
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">Salary Range</h3>
                        <FilterCheckbox
                            name="All"
                            checked={selectedSalaryRange === null}
                            onChange={() => setSelectedSalaryRange(null)}
                        />
                        {SALARY_RANGE_OPTIONS.map((range) => (
                            <FilterCheckbox
                                key={range}
                                name={range}
                                checked={selectedSalaryRange === range}
                                onChange={() => setSelectedSalaryRange(range)}
                            />
                        ))}
                    </nav>
                    <div className="mt-8">
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Apply Filters
                        </button>
                    </div>
                </aside>
                <main className="w-3/4 px-2 sm:px-4 md:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">All Jobs</h1>
                        <span className="text-2xl font-bold">{filteredProjects.length} job{filteredProjects.length !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-gray-600 mb-4">Check out what's best for you.</p>
                    <div className="space-y-3 mt-2">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => setSelectedProject(project)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No jobs found</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {/* Detail Modal */}
            {selectedProject && (
                <ProjectCardModalJobPage
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
            <Footer />
        </div>
    );
}