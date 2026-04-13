import React from 'react';
import '../styles/CampaignList.css';

export default function CampaignList({ campaigns, loading, onEdit, onRefresh }) {
  if (loading) {
    return <div className="loading">⏳ Загрузка кампаний...</div>;
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="empty-state">
        <h3>📭 Кампаний не найдено</h3>
        <p>Создайте первую кампанию, чтобы начать</p>
      </div>
    );
  }

  return (
    <div className="campaign-list">
      <div className="list-header">
        <h2>📋 Ваши кампании</h2>
        <button className="btn btn-outline" onClick={onRefresh}>
          🔄 Обновить
        </button>
      </div>

      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <div key={campaign.id} className={`campaign-card ${campaign.status}`}>
            <div className="card-header">
              <h3>{campaign.name}</h3>
              <span className={`status-badge ${campaign.status}`}>
                {campaign.status === 'running' ? '▶️ Запущена' : '⏸️ Пауза'}
              </span>
            </div>

            <div className="card-content">
              <div className="info-row">
                <span className="label">📡 Каналы:</span>
                <span className="value">{campaign.target_channels?.split(',').length || 0}</span>
              </div>

              <div className="info-row">
                <span className="label">👥 Аккаунты:</span>
                <span className="value">{campaign.accounts_pool?.split(',').length || 0}</span>
              </div>

              <div className="info-row">
                <span className="label">📊 Сегодня:</span>
                <span className="value">{campaign.comments_today || 0}/{campaign.max_per_day}</span>
              </div>

              <div className="info-row">
                <span className="label">🎯 Режим:</span>
                <span className="value">{campaign.behavior_mode || 'natural'}</span>
              </div>

              <div className="info-row">
                <span className="label">⏰ Часы:</span>
                <span className="value">
                  {campaign.active_hours_start} - {campaign.active_hours_end}
                </span>
              </div>
            </div>

            <div className="card-actions">
              <button 
                className="btn btn-small"
                onClick={() => onEdit(campaign)}
              >
                ✏️ Редактировать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
