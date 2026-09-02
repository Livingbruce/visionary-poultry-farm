import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import '../../styles/poultry/population.css';
import ManagePopulationForm from './Form/ManagePopulation';
import ManageTradeForm from './Form/ManageTradeForm';
import ManageHousesForm from './Form/ManageHouseForm';

function Population({ setSelectedCategory }) {
  const [subView, setSubView] = useState(null);

  if (subView === 'population') {
    return <ManagePopulationForm onBack={() => setSubView(null)} />;
  }

  if (subView === 'trade') {
    return <ManageTradeForm onBack={() => setSubView(null)} />;
  }

  if (subView === 'houses') {
    return <ManageHousesForm onBack={() => setSubView(null)} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => setSelectedCategory && setSelectedCategory(null)}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button> 
      </div>

      <div className="page-cards">
        <div className="card">
          <h1>Chicken</h1>
          <div id="chicken">400</div>
          <div id="chickenValue">Est. Value: KES 5,000</div>
          <p>All chicken in the farm</p>
        </div>

        <div className="card">
          <h1>Chicks</h1>
          <div id="chicks">100</div>
          <div id="chicksValue">Est. Value: KES 1,000</div>
          <p>All chicks in the farm</p>
        </div>

        <div className="card">
          <h1>Sold</h1>
          <div id="chickenSold">200.00</div>
          <div id="sellValue">Sold at: --</div>
          <p>All chicken sold from the farm</p>
        </div>

        <div className="card">
          <h1>Bought</h1>
          <div id="chickenBought">100.00</div>
          <div id="buyValue">Bought at: --</div>
          <p>All chicken bought by the farm</p>
        </div>

        <div className="card">
          <h1>Chicken Houses</h1>
          <div id="housesCount">20</div>
          <div id="housesValue">Est. Value: KES 10,000</div>
          <p>Current Chicken Houses</p>
        </div>
      </div>

      <div className="page-folders">
        <div className="folder" onClick={() => setSubView('population')}>
          <div>
            <h1>Manage Poultry Population</h1>
            <p>Manage poultry startup and flock batches</p>
          </div>
          <ArrowRight size={20} />
        </div>

        <div className="folder" onClick={() => setSubView('trade')}>
          <div>
            <h1>Manage Buying and Selling</h1>
            <p>Manage poultry from selling or buying</p>
          </div>
          <ArrowRight size={20} />
        </div>

        <div className="folder" onClick={() => setSubView('houses')}>
          <div>
            <h1>Manage Poultry Houses</h1>
            <p>Add, reduce, label, assign and manage poultry houses</p>
          </div>
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
}

export default Population;