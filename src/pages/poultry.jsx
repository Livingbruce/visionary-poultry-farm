import { useState } from 'react';
import { ArrowRight, Folder as FolderIcon } from 'lucide-react';
import { folders } from '../components/PoultryCards';
import Population from './poultry/Population';
import Medication from './poultry/Medication/Medication';
import ChickHatching from './poultry/Hatching/ChickHatching';
import Mortality from './poultry/Mortality/Mortality'
import '../styles/Poultry.css';

function Poultry() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory === 'population') {
    return <Population setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />
  } else if (selectedCategory === 'medication') {
    return <Medication setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />
  } else if (selectedCategory === 'hatching') {
    return <ChickHatching setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />
  } else if (selectedCategory === 'mortality') {
    return <Mortality setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />
  }

  return (
    <div className="page poultry-page">
      <div className="page-header">
        <h1>Poultry</h1>
        <p>View and manage your poultry population.</p>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="card-section">
        <div className="card">
          <h2>Grown Poultry</h2>
          <div className="poultry-total" id="grown-total">0</div>
          <p>Total number of living chickens in the farm</p>
        </div>

        <div className="card">
          <h2>Chicks</h2>
          <div className="poultry-total" id="chicks-total">0</div>
          <p>Total number of living chicks present in the farm</p>
        </div>

        <div className="card">
          <h2>Mortality</h2>
          <div className="poultry-total" id="mortality-total">0</div>
          <p>Total fatalities in the farm</p>
        </div>
      </div>

      {/* Directory / Folders Column List */}
      <div className="poultry-analysis">
        <div className="section-header">
          <h2>Poultry Directory</h2>
        </div>

        <div className="folder-list">
          {folders.map((item) => (
            <div 
              key={item.id} 
              className="folder-row"
              onClick={() => setSelectedCategory(item.id)}
            >
              <div className="folder-icon-wrapper">
                <FolderIcon size={20} className="folder-icon" />
              </div>
              <div className="folder-details">
                <span className="folder-title">{item.title}</span>
                <span className="folder-desc">{item.desc}</span>
              </div>
              <div className="folder-action">
                <ArrowRight size={18} className="arrow-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Poultry;