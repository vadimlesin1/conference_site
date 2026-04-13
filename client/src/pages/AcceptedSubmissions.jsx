import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AcceptedSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSection, setSelectedSection] = useState("all");

    useEffect(() => {
        fetch("http://localhost:5000/api/public/submissions")
            .then(res => res.json())
            .then(data => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // --- ЛОГИКА ФИЛЬТРАЦИИ ---
    const uniqueSections = ["all", ...new Set(submissions.map(s => s.section_name))];

    const filteredList = submissions.filter(sub => {
        const matchesSearch = 
            sub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            sub.speaker_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSection = selectedSection === "all" || sub.section_name === selectedSection;
        return matchesSearch && matchesSection;
    });

    const groupedSubmissions = {};
    filteredList.forEach(sub => {
        if (!groupedSubmissions[sub.section_name]) groupedSubmissions[sub.section_name] = [];
        groupedSubmissions[sub.section_name].push(sub);
    });

    const sortedSectionNames = Object.keys(groupedSubmissions).sort();

    // --- ИКОНКИ (Lucide Style) ---
    const IconSearch = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{position:'absolute', left: 10, top: '50%', transform: 'translateY(-50%)'}}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
    const IconFilter = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
    const IconFileText = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:10}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
    const IconUser = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
    const IconBuilding = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:4}}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="12" y1="22" x2="12" y2="22.01"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>;

    // --- СТИЛИ ---
    const styles = {
        page: { background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' },
        container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', flex: 1, width: '100%' },
        
        // Заголовок
        header: { 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderBottom: '2px solid #003366', paddingBottom: '20px', marginBottom: '30px'
        },
        title: { fontSize: '28px', color: '#333', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center' },
        
        // Панель фильтров
        filterBar: { 
            marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap',
            background: '#fff', padding: '15px 20px', borderRadius: '6px', border: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        },
        searchWrapper: { position: 'relative', flex: 1, minWidth: '250px' },
        searchInput: {
            padding: '10px 15px 10px 35px', width: '100%', 
            borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box'
        },
        filterWrapper: { display: 'flex', alignItems: 'center' },
        sectionSelect: {
            padding: '9px 15px', minWidth: '220px', borderRadius: '4px', 
            border: '1px solid #ced4da', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer', outline: 'none', fontWeight: '500', color: '#495057'
        },

        // Блок секции
        sectionBlock: { 
            background: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0', 
            marginBottom: '25px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        },
        sectionHeader: { 
            background: '#f8f9fa', padding: '12px 20px', borderBottom: '1px solid #e0e0e0',
            color: '#003366', fontSize: '16px', fontWeight: '700', margin: 0,
            borderLeft: '4px solid #003366' // Акцент слева
        },
        
        // Список докладов
        rowItem: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '15px 20px',
            borderBottom: '1px solid #f1f1f1',
            fontSize: '14px',
            transition: 'background 0.2s'
        },
        rowItemLast: { borderBottom: 'none' },

        itemContent: { paddingRight: '20px' },
        itemTitle: { fontWeight: '600', color: '#212529', lineHeight: '1.4', fontSize: '15px', marginBottom: '4px' },
        
        metaBlock: { textAlign: 'right', minWidth: '220px', flexShrink: 0 },
        speakerRow: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: '600', color: '#0056b3', fontSize: '13px', marginBottom: '3px' },
        institutionRow: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '12px', color: '#6c757d' },

        empty: { textAlign: 'center', color: '#adb5bd', padding: '50px', border: '2px dashed #dee2e6', borderRadius: '6px' }
    };

    return (
        <div style={styles.page}>
            <Navbar />
            
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        <IconFileText /> Опубликованные доклады
                    </h1>
                </div>

                {/* Фильтры */}
                <div style={styles.filterBar}>
                    <div style={styles.searchWrapper}>
                        <IconSearch />
                        <input 
                            type="text" 
                            placeholder="Поиск по теме или автору..." 
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div style={styles.filterWrapper}>
                        <span style={{ fontSize: '13px', color: '#555', marginRight: '10px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                            <IconFilter /> Секция:
                        </span>
                        <select 
                            style={styles.sectionSelect}
                            value={selectedSection}
                            onChange={e => setSelectedSection(e.target.value)}
                        >
                            <option value="all">Все секции</option>
                            {uniqueSections.filter(s => s !== "all").sort().map(sec => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign:'center', marginTop: '40px', color: '#666'}}>Загрузка списка докладов...</div>
                ) : sortedSectionNames.length === 0 ? (
                    <div style={styles.empty}>По вашему запросу ничего не найдено</div>
                ) : (
                    sortedSectionNames.map(secName => (
                        <div key={secName} style={styles.sectionBlock}>
                            <h2 style={styles.sectionHeader}>{secName}</h2>
                            <div>
                                {groupedSubmissions[secName].map((sub, index, arr) => (
                                    <div 
                                        key={sub.id} 
                                        style={index === arr.length - 1 ? {...styles.rowItem, ...styles.rowItemLast} : styles.rowItem}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fcfcfc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={styles.itemContent}>
                                            <div style={styles.itemTitle}>{sub.title}</div>
                                        </div>
                                        
                                        <div style={styles.metaBlock}>
                                            <div style={styles.speakerRow}>
                                                <IconUser /> {sub.speaker_name}
                                            </div>
                                            {sub.institution && (
                                                <div style={styles.institutionRow} title={sub.institution}>
                                                    <IconBuilding /> 
                                                    {sub.institution.length > 35 ? sub.institution.slice(0, 35) + '...' : sub.institution}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default AcceptedSubmissions;
