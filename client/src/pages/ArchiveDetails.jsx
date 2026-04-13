import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ArchiveDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/archive/${id}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [id]);

    const styles = {
        container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' },
        backBtn: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center' },
        headerBox: { background: '#003366', color: 'white', padding: '30px', borderRadius: '6px', marginBottom: '30px' },
        sectionHeader: { marginTop: '30px', marginBottom: '15px', color: '#003366', borderBottom: '1px solid #ddd', paddingBottom: '5px' },
        card: { background: '#fff', border: '1px solid #e0e0e0', padding: '20px', marginBottom: '15px', borderRadius: '4px' }
    };

    if (loading) return <div>Загрузка...</div>;
    if (!data) return <div>Данные не найдены</div>;

    // Группируем доклады по секциям
    const sections = {};
    data.data.forEach(item => {
        if (!sections[item.section_name]) sections[item.section_name] = [];
        sections[item.section_name].push(item);
    });

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <button onClick={() => navigate('/archive')} style={styles.backBtn}>← Назад к списку</button>
                
                <div style={styles.headerBox}>
                    <h1 style={{margin:0}}>{data.info.title} ({data.info.year})</h1>
                    <p style={{margin:'10px 0 0', opacity: 0.8}}>{data.info.theme}</p>
                </div>

                {Object.keys(sections).map(secName => (
                    <div key={secName}>
                        <h2 style={styles.sectionHeader}>{secName}</h2>
                        {sections[secName].map((sub, i) => (
                            <div key={i} style={styles.card}>
                                <h3 style={{marginTop:0, color:'#333'}}>{sub.title}</h3>
                                <p style={{fontSize:'14px', color:'#555', fontStyle:'italic'}}>Автор: {sub.speaker_name}</p>
                                <p style={{color:'#666', fontSize:'14px', lineHeight:'1.5'}}>{sub.abstract}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArchiveDetails;
