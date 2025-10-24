import Footer from "../Components/Footer";
import SearchIcon from "../Public/search_icon.svg";

export default function JobPage() {
    const jobCategories = [
        { name: "Web development" },
        { name: "Mobile development" },
        { name: "Embedded Engineering" },
        { name: "UI/UX Design" },
        { name: "Quality Assurance" },
        { name: "Project Management" },
        { name: "DevOps Engineering" },
        { name: "Digital Security" },
        { name: "Other" },
    ];
    const workForm = [
        { name: "Offline" },
        { name: "Online" },
        { name: "Hybrid" },
        { name: "Other" },
    ];

    const paymentMethod = [
        { name: "Per Hour" },
        { name: "Per Month" },
        { name: "Per Project" },
        { name: "Other" },
    ];

    const salaryRange = [
        { name: "Under 1.000.000 VND" },
        { name: "1.000.000 - 10.000.000 VND" },
        { name: "Above 10.000.000 VND" },
        { name: "Other" },
    ];

    // Component Checkbox
    const FilterCheckbox = ({ name }) => (
        <label className="flex items-center text-sm text-gray-700 mb-2 hover:bg-gray-200 rounded px-2 py-1 transition-colors duration-150">
            <input type="checkbox" className="mr-2 rounded" />
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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <img
                            src={SearchIcon}
                            alt="Search"
                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
                    <nav>
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">
                            Job Category
                        </h3>
                        {jobCategories.map((category) => (
                            <FilterCheckbox key={category.name} name={category.name} />
                        ))}
                    </nav>
                    <nav className="mt-6">
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">
                            Work Form
                        </h3>
                        {workForm.map((form) => (
                            <FilterCheckbox key={form.name} name={form.name} />
                        ))}
                    </nav>
                    <nav className="mt-6">
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">
                            Payment Method
                        </h3>
                        {paymentMethod.map((method) => (
                            <FilterCheckbox key={method.name} name={method.name} />
                        ))}
                    </nav>
                    <nav className="mt-6">
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">
                            Salary Range
                        </h3>
                        {salaryRange.map((range) => (
                            <FilterCheckbox key={range.name} name={range.name} />
                        ))}
                    </nav>
                    <div className="mt-8">
                        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Apply Filters
                        </button>
                    </div>
                </aside>
                <main className="w-3/4 p-6">
                    <h1 className="text-2xl font-bold mb-4">All Jobs</h1>
                    <p className="text-gray-600 mb-4">
                        Check out what's best for you.
                    </p>
                </main>
            </div>
            <Footer />
        </div>
    );
}