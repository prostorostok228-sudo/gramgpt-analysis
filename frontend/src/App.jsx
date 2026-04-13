import React, { useState, useEffect } from 'react';
import './styles/App.css';
import CampaignList from './components/CampaignList';
import CampaignForm from './components/CampaignForm';

export default function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns/neuro-comment');
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async (campaignData) => {
    try {
      const url = selectedCampaign 
        ? `/api/campaigns/neuro-comment/${selectedCampaign.id}`
        : '/api/campaigns/neuro-comment';
      
      const method = selectedCampaign ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      if (res.ok) {
        fetchCampaigns();
        setShowForm(false);
        setSelectedCampaign(null);
      }
    } catch (err) {
      console.error('Error saving campaign:', err);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 Creonix — Нейро Комментирование</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedCampaign(null);
            setShowForm(true);
          }}
        >
          ➕ Новая кампания
        </button>
      </header>

      <div className="container">
        {showForm && (
          <div className="form-container">
            <CampaignForm 
              campaign={selectedCampaign}
              onSave={handleSaveCampaign}
              onCancel={() => {
                setShowForm(false);
                setSelectedCampaign(null);
              }}
            />
          </div>
        )}

        {!showForm && (
          <CampaignList 
            campaigns={campaigns}
            loading={loading}
            onEdit={(campaign) => {
              setSelectedCampaign(campaign);
              setShowForm(true);
            }}
            onRefresh={fetchCampaigns}
          />
        )}
      </div>
    </div>
  );
}
