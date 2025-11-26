
import React, { useState } from 'react';
import MenuCard from '../components/MenuCard';
import { menuItems } from '../data/mockDB';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import ToggleSwitch from '../components/ToggleSwitch';
import SegmentedControl from '../components/SegmentedControl';
import MenuCardSkeleton from '../components/MenuCardSkeleton';
import Dropdown from '../components/Dropdown';
import StatCard from '../components/StatCard';
import LineChart from '../components/LineChart';
import { Edit, Trash2, BookOpen, ArrowRight } from 'lucide-react';

const chartData = [
    { day: 'Mon', value: 18 }, { day: 'Tue', value: 24 }, { day: 'Wed', value: 22 },
    { day: 'Thu', value: 30 }, { day: 'Fri', value: 45 }, { day: 'Sat', value: 52 },
    { day: 'Sun', value: 35 },
];


const AdminComponentGalleryPage: React.FC = () => {
  const sampleMenuItem = menuItems[5]; // Use item with a badge
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'List' | 'Grid'>('Grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('Main Courses');

  const sectionClasses = "p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg";
  const sectionTitleClasses = "text-3xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          {/* Subheader can remain if it's specific to the page content */}
          <p className="mt-4 text-xl text-brand-secondary dark:text-gray-400 max-w-2xl mx-auto">
            A visual inventory of all reusable components. Develop in isolation, test all states, and build pages faster.
          </p>
        </div>

        {/* Section Wrapper */}
        <div className="space-y-12">

          {/* Typography Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Typography Scale</h2>
            <div className="space-y-4">
              <h1 className="text-6xl font-bold font-sans text-brand-dark dark:text-gray-200">H1 Heading - Exquisite Dining</h1>
              <h2 className="text-5xl font-bold font-sans text-brand-dark dark:text-gray-200">H2 Heading - Our Story</h2>
              <h3 className="text-4xl font-bold font-sans text-brand-dark dark:text-gray-200">H3 Heading - Appetizers</h3>
              <h4 className="text-3xl font-bold font-sans text-brand-dark dark:text-gray-200">H4 Heading - Bruschetta</h4>
              <h5 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200">H5 Heading</h5>
              <h6 className="text-xl font-bold font-sans text-brand-dark dark:text-gray-200">H6 Heading</h6>
              <p className="text-lg text-brand-secondary dark:text-gray-400">
                Body Large. A symphony of flavors, crafted with passion and served with love. Welcome to a place where every meal is a celebration.
              </p>
              <p className="text-base text-brand-secondary dark:text-gray-400">
                Body Regular. Grilled bread topped with fresh tomatoes, garlic, basil, and olive oil.
              </p>
            </div>
          </section>

          {/* Color Palette Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-brand-primary"></div>
                <h3 className="mt-2 font-semibold dark:text-gray-200">Primary</h3>
                <p className="text-sm text-brand-secondary dark:text-gray-400">var(--color-brand-primary-rgb)</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-brand-secondary"></div>
                <h3 className="mt-2 font-semibold dark:text-gray-200">Secondary</h3>
                <p className="text-sm text-brand-secondary dark:text-gray-400">#6E6E73</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-brand-dark"></div>
                <h3 className="mt-2 font-semibold dark:text-gray-200">Dark</h3>
                <p className="text-sm text-brand-secondary dark:text-gray-400">#1D1D1F</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-brand-light border dark:bg-gray-700 dark:border-gray-600"></div>
                <h3 className="mt-2 font-semibold dark:text-gray-200">Light</h3>
                <p className="text-sm text-brand-secondary dark:text-gray-400">#F5F5F5</p>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-lg bg-brand-background border dark:bg-gray-900 dark:border-gray-700"></div>
                <h3 className="mt-2 font-semibold dark:text-gray-200">Background</h3>
                <p className="text-sm text-brand-secondary dark:text-gray-400">#F9F9F9</p>
              </div>
            </div>
          </section>
          
          {/* Alerts Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Alerts</h2>
            <div className="space-y-4">
              <Alert variant="success" message="Your reservation has been confirmed successfully." />
              <Alert variant="error" message="Failed to submit the form. Please check your inputs." />
              <Alert variant="info" message="Our holiday hours are from 10am to 6pm." />
            </div>
          </section>
          
          {/* Modals Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Modals</h2>
            <div className="flex flex-wrap items-center gap-6">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 transform hover:scale-105"
                >
                  Open Confirmation Modal
                </button>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Action">
              <p className="text-brand-secondary dark:text-gray-300 text-base leading-relaxed">
                Are you sure you want to proceed with this action? This can't be undone.
              </p>
              <div className="flex items-center justify-end pt-6 space-x-2">
                  <button onClick={() => setIsModalOpen(false)} type="button" className="text-brand-secondary dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full border border-gray-200 dark:border-gray-600 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:hover:text-white focus:z-10">Decline</button>
                  <button onClick={() => setIsModalOpen(false)} type="button" className="text-white bg-brand-primary hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center">Accept</button>
              </div>
            </Modal>
          </section>

          {/* Controls Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-gray-200">Toggle Switch</h3>
                <ToggleSwitch 
                  id="notifications"
                  label="Enable Notifications"
                  checked={notificationsEnabled}
                  onChange={setNotificationsEnabled}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold dark:text-gray-200">Segmented Control</h3>
                <SegmentedControl
                  id="view-mode"
                  options={['List', 'Grid']}
                  value={viewMode}
                  onChange={(val) => setViewMode(val as 'List' | 'Grid')}
                />
              </div>
            </div>
          </section>


          {/* Buttons Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Buttons</h2>
            <div className="flex flex-wrap items-center gap-6">
              <button className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 transform hover:scale-105">
                Primary Button
              </button>
              <button disabled className="bg-brand-primary text-white px-8 py-3 rounded-full font-medium transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Disabled Button
              </button>
              <button className="bg-brand-secondary text-white px-8 py-3 rounded-full font-medium hover:bg-gray-600 transition-colors duration-300 transform hover:scale-105">
                Secondary Button
              </button>
               <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <Edit className="w-5 h-5 text-brand-secondary dark:text-gray-400" />
              </button>
              <button className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  <Trash2 className="w-5 h-5 text-brand-secondary dark:text-gray-400" />
              </button>
            </div>
          </section>

          {/* Forms Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Form Inputs</h2>
            <div className="max-w-md space-y-6">
              <div>
                <label htmlFor="gallery-email" className="block text-sm font-medium text-brand-secondary dark:text-gray-400 mb-1">Email address</label>
                <input
                  id="gallery-email"
                  type="email"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent sm:text-lg transition"
                  placeholder="you@example.com"
                />
              </div>
               <div>
                  <label htmlFor="gallery-message" className="block text-sm font-medium text-brand-secondary dark:text-gray-400 mb-1">Message</label>
                  <textarea id="gallery-message" rows={4} className="block w-full shadow-sm py-3 px-4 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg text-lg transition focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent" placeholder="Your message..."></textarea>
                </div>
              <div>
                  <label htmlFor="gallery-category" className="block text-sm font-medium text-brand-secondary dark:text-gray-400 mb-1">Category</label>
                  <Dropdown
                    options={['Appetizers', 'Main Courses', 'Desserts', 'Beverages']}
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                  />
              </div>
            </div>
          </section>

          {/* Dashboard Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Dashboard Components</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <StatCard 
                title="Example Stat Card"
                value="123"
                icon={<BookOpen className="w-8 h-8 text-brand-primary" />}
              />
            </div>
          </section>
          
          {/* Charts Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Charts</h2>
            <div className="h-96">
                <LineChart data={chartData} />
            </div>
          </section>

          {/* Cards Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Cards</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
               <MenuCard 
                  id={sampleMenuItem.id}
                  name={sampleMenuItem.name}
                  description={sampleMenuItem.description}
                  price={sampleMenuItem.price}
                  image={sampleMenuItem.image}
                  badge={sampleMenuItem.badge}
                />
            </div>
          </section>

          {/* Loaders Section */}
          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>Loaders</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
              <MenuCardSkeleton />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default AdminComponentGalleryPage;