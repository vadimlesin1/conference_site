import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const ConferenceInfoBlock = ({ activeConference }) => {
    const { language } = useLanguage();

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (!activeConference) {
        return (
            <div style={{
                padding: '16px 20px',
                background: '#fff3cd',
                color: '#856404',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #ffeeba',
                fontSize: '14px'
            }}>
                ️ {language === 'ru' ? 'В данный момент нет активной конференции.' : 'No active conference at this time.'}
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #003366 0%, #004488 100%)',
            color: 'white',
            padding: '20px 24px',
            borderRadius: '8px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,51,102,0.2)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '4px' }}>
                        {language === 'ru' ? 'Текущая конференция' : 'Current Conference'}
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        {activeConference.title}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: '6px', fontSize: '13px' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7, marginBottom: '2px' }}>
                            {language === 'ru' ? 'Даты проведения' : 'Dates'}
                        </div>
                        {formatDate(activeConference.date_start)} — {formatDate(activeConference.date_end)}
                    </div>
                    {activeConference.submission_deadline && (
                        <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: '6px', fontSize: '13px' }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7, marginBottom: '2px' }}>
                                {language === 'ru' ? 'Дедлайн подачи' : 'Submission Deadline'}
                            </div>
                            {formatDate(activeConference.submission_deadline)}
                        </div>
                    )}
                    {activeConference.location && (
                        <div style={{ background: 'rgba(255,255,255,0.12)', padding: '8px 14px', borderRadius: '6px', fontSize: '13px' }}>
                            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.7, marginBottom: '2px' }}>
                                {language === 'ru' ? 'Место проведения' : 'Location'}
                            </div>
                            {activeConference.location}
                        </div>
                    )}
                </div>
            </div>
            {activeConference.description && (
                <div style={{ marginTop: '12px', fontSize: '13px', opacity: 0.85, lineHeight: '1.5' }}>
                    {activeConference.description}
                </div>
            )}
        </div>
    );
};

export default ConferenceInfoBlock;
