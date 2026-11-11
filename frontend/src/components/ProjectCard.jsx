import React, { useState } from 'react';
import {
  Play,
  Code,
  ExternalLink,
  FileText,
  Heart,
  Brain,
  GraduationCap,
  Building2,
  Layers,
  Stethoscope,
  Truck,
  Landmark,
  ShoppingBag,
  Users,
  Sprout,
  Activity,
  Gauge,
  ShieldCheck,
  CloudCog,
  Mic,
  Sun,
  ShieldAlert,
  Network,
  Scan,
  Cpu,
  Coins,
  FolderGit2,
  Pencil,
  Trash2
} from 'lucide-react';

// Official Figma 5-color SVG Icon
const FigmaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
  </svg>
);

// Map icon strings to Lucide components
const iconMap = {
  'heart': Heart,
  'brain': Brain,
  'graduation-cap': GraduationCap,
  'layers': Layers,
  'stethoscope': Stethoscope,
  'hospital': Building2,
  'building-2': Building2,
  'truck': Truck,
  'landmark': Landmark,
  'shopping-bag': ShoppingBag,
  'users': Users,
  'sprout': Sprout,
  'activity': Activity,
  'gauge': Gauge,
  'shield-check': ShieldCheck,
  'cloud-cog': CloudCog,
  'mic': Mic,
  'sun': Sun,
  'shield-alert': ShieldAlert,
  'network': Network,
  'scan': Scan,
  'cpu': Cpu,
  'coins': Coins,
};

export const ProjectCard = ({ project, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const isLive = project.status === 'Live';
  const hasLiveUrl = Boolean(project.liveUrl && project.liveUrl.trim());
  const canOpenLive = isLive && hasLiveUrl;

  const IconComponent = iconMap[project.icon] || FolderGit2;

  // Render high-fidelity CSS dashboard preview screens matching the screenshot
  const renderPreviewMockup = () => {
    // 1. Nurture Care Healthcare Preview
    if (project.previewType === 'healthcare-nurture' || project.name.includes('Nurture')) {
      return (
        <div className="mockup-preview-screen">
          <div className="mockup-sidebar" style={{ background: '#0F1E36' }}>
            <div className="mockup-brand">
              <Heart size={11} color="#38BDF8" />
              <span>Nurture Care</span>
            </div>
            <div className="mockup-nav-item active">Dashboard</div>
            <div className="mockup-nav-item">Appointments</div>
            <div className="mockup-nav-item">Patients</div>
            <div className="mockup-nav-item">Doctors</div>
            <div className="mockup-nav-item">Services</div>
            <div className="mockup-nav-item">Reports</div>
          </div>
          <div className="mockup-content">
            <div className="mockup-header-title">Dashboard</div>
            <div className="mockup-metrics-grid">
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Total Appointments</div>
                <div className="mockup-metric-val">1,248</div>
                <div className="mockup-metric-inc">↑ 12%</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Patients</div>
                <div className="mockup-metric-val">892</div>
                <div className="mockup-metric-inc">↑ 6%</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Doctors</div>
                <div className="mockup-metric-val">36</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Services</div>
                <div className="mockup-metric-val">12</div>
              </div>
            </div>
            <div className="mockup-chart-wave">
              <svg className="mockup-wave-svg" viewBox="0 0 300 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="nurtureWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0866E8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0866E8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,38 C50,32 90,45 140,24 C190,10 240,30 300,8 L300,50 L0,50 Z" fill="url(#nurtureWave)" />
                <path d="M0,38 C50,32 90,45 140,24 C190,10 240,30 300,8" fill="none" stroke="#0866E8" strokeWidth="2.2" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    // 2. Bright Future International School Preview
    if (project.previewType === 'school-brightfuture' || project.name.includes('Bright Future')) {
      return (
        <div className="mockup-preview-screen">
          <div className="mockup-sidebar" style={{ background: '#0D261A' }}>
            <div className="mockup-brand">
              <GraduationCap size={11} color="#34D399" />
              <span>Bright Future</span>
            </div>
            <div className="mockup-nav-item active" style={{ background: '#059669' }}>Dashboard</div>
            <div className="mockup-nav-item">Students</div>
            <div className="mockup-nav-item">Teachers</div>
            <div className="mockup-nav-item">Classes</div>
            <div className="mockup-nav-item">Exams</div>
            <div className="mockup-nav-item">Reports</div>
          </div>
          <div className="mockup-content">
            <div className="mockup-metrics-grid">
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Students</div>
                <div className="mockup-metric-val">2,420</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Teachers</div>
                <div className="mockup-metric-val">128</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Classes</div>
                <div className="mockup-metric-val">64</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Attendance</div>
                <div className="mockup-metric-val" style={{ color: '#059669' }}>96%</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#475569' }}>Student Enrollment</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '36px', paddingLeft: '4px' }}>
                <div style={{ width: '12px', height: '14px', background: '#38BDF8', borderRadius: '2px' }}></div>
                <div style={{ width: '12px', height: '22px', background: '#38BDF8', borderRadius: '2px' }}></div>
                <div style={{ width: '12px', height: '30px', background: '#38BDF8', borderRadius: '2px' }}></div>
                <div style={{ width: '12px', height: '34px', background: '#0866E8', borderRadius: '2px' }}></div>
                <div style={{ width: '12px', height: '26px', background: '#38BDF8', borderRadius: '2px' }}></div>
                <div style={{ width: '12px', height: '32px', background: '#38BDF8', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Kalpanaaa Business OS Preview
    if (project.previewType === 'business-os' || project.name.includes('Business OS')) {
      return (
        <div className="mockup-preview-screen">
          <div className="mockup-sidebar" style={{ background: '#1E1538' }}>
            <div className="mockup-brand">
              <Layers size={11} color="#A78BFA" />
              <span>Business OS</span>
            </div>
            <div className="mockup-nav-item active" style={{ background: '#7C3AED' }}>Dashboard</div>
            <div className="mockup-nav-item">CRM</div>
            <div className="mockup-nav-item">Projects</div>
            <div className="mockup-nav-item">HR & People</div>
            <div className="mockup-nav-item">Finance</div>
            <div className="mockup-nav-item">Reports</div>
          </div>
          <div className="mockup-content">
            <div className="mockup-header-title">Business OS</div>
            <div className="mockup-metrics-grid">
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Total Revenue</div>
                <div className="mockup-metric-val">₹24.5L</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Projects</div>
                <div className="mockup-metric-val">36</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Clients</div>
                <div className="mockup-metric-val">18</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Team</div>
                <div className="mockup-metric-val">42</div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '32px' }}>
                <div style={{ width: '8px', height: '12px', background: '#6366F1', borderRadius: '2px' }}></div>
                <div style={{ width: '8px', height: '18px', background: '#6366F1', borderRadius: '2px' }}></div>
                <div style={{ width: '8px', height: '24px', background: '#6366F1', borderRadius: '2px' }}></div>
                <div style={{ width: '8px', height: '30px', background: '#7C3AED', borderRadius: '2px' }}></div>
                <div style={{ width: '8px', height: '22px', background: '#6366F1', borderRadius: '2px' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '4px solid #38BDF8', borderTopColor: '#0866E8' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.52rem', color: '#64748B' }}>
                  <span>● Live</span>
                  <span>● In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. Dr. K. Tripathi Clinic Preview
    if (project.previewType === 'clinic-tripathi' || project.name.includes('Tripathi')) {
      return (
        <div className="mockup-preview-screen">
          <div className="mockup-sidebar" style={{ background: '#1D1934' }}>
            <div className="mockup-brand">
              <Stethoscope size={11} color="#C084FC" />
              <span>Homeopathy Clinic</span>
            </div>
            <div className="mockup-nav-item active" style={{ background: '#8B5CF6' }}>Dashboard</div>
            <div className="mockup-nav-item">Appointments</div>
            <div className="mockup-nav-item">Patients</div>
            <div className="mockup-nav-item">Prescriptions</div>
            <div className="mockup-nav-item">History</div>
            <div className="mockup-nav-item">Settings</div>
          </div>
          <div className="mockup-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mockup-header-title">Appointments</span>
              <div style={{ display: 'flex', gap: '4px', fontSize: '0.54rem' }}>
                <span style={{ background: '#6366F1', color: '#fff', padding: '1px 5px', borderRadius: '4px' }}>Today (8)</span>
                <span style={{ color: '#64748B' }}>Upcoming (14)</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', fontSize: '0.56rem' }}>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>Ravi Kumar</span>
                <span style={{ color: '#64748B' }}>24 Nov, 10:00 AM</span>
                <span style={{ background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>Confirmed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', fontSize: '0.56rem' }}>
                <span style={{ fontWeight: 600, color: '#1E293B' }}>Sneha Reddy</span>
                <span style={{ color: '#64748B' }}>24 Nov, 11:30 AM</span>
                <span style={{ background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 5. Suicidal Tweet Detection ML Preview
    if (project.previewType === 'ai-ml-tweet' || project.name.includes('Tweet')) {
      return (
        <div className="mockup-preview-screen">
          <div className="mockup-sidebar" style={{ background: '#1A1733' }}>
            <div className="mockup-brand">
              <Brain size={11} color="#818CF8" />
              <span>ML Model</span>
            </div>
            <div className="mockup-nav-item active">Overview</div>
            <div className="mockup-nav-item">Dataset</div>
            <div className="mockup-nav-item">Training</div>
            <div className="mockup-nav-item">Evaluation</div>
            <div className="mockup-nav-item">Results</div>
          </div>
          <div className="mockup-content">
            <div className="mockup-header-title">Model Performance</div>
            <div className="mockup-ml-grid">
              <div className="mockup-gauge-circle">
                <span className="mockup-gauge-val">94.39%</span>
                <span className="mockup-gauge-sub">Accuracy</span>
              </div>
              <div className="mockup-ml-bars">
                <div className="mockup-bar-row">
                  <div className="mockup-bar-labels">
                    <span>Non-Suicidal</span>
                    <span>82%</span>
                  </div>
                  <div className="mockup-bar-track">
                    <div className="mockup-bar-fill" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div className="mockup-bar-row">
                  <div className="mockup-bar-labels">
                    <span>Suicidal</span>
                    <span>94%</span>
                  </div>
                  <div className="mockup-bar-track">
                    <div className="mockup-bar-fill" style={{ width: '94%', background: '#8B5CF6' }}></div>
                  </div>
                </div>
                <div className="mockup-bar-row">
                  <div className="mockup-bar-labels">
                    <span>Neutral</span>
                    <span>76%</span>
                  </div>
                  <div className="mockup-bar-track">
                    <div className="mockup-bar-fill" style={{ width: '76%', background: '#A78BFA' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 6. Hospital Management System HMS Preview
    if (project.previewType === 'hospital-hms' || project.name.includes('Hospital')) {
      return (
        <div className="mockup-preview-screen">
          <div className="mockup-sidebar" style={{ background: '#0D2630' }}>
            <div className="mockup-brand">
              <Building2 size={11} color="#2DD4BF" />
              <span>Hospital HMS</span>
            </div>
            <div className="mockup-nav-item active" style={{ background: '#0D9488' }}>Dashboard</div>
            <div className="mockup-nav-item">Patients</div>
            <div className="mockup-nav-item">Appointments</div>
            <div className="mockup-nav-item">Billing</div>
            <div className="mockup-nav-item">Inventory</div>
            <div className="mockup-nav-item">Reports</div>
          </div>
          <div className="mockup-content">
            <div className="mockup-header-title">Hospital Overview</div>
            <div className="mockup-metrics-grid">
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Total Patients</div>
                <div className="mockup-metric-val">2,420</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Appointments</div>
                <div className="mockup-metric-val">186</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Rooms</div>
                <div className="mockup-metric-val">64</div>
              </div>
              <div className="mockup-metric-box">
                <div className="mockup-metric-lbl">Staff</div>
                <div className="mockup-metric-val">128</div>
              </div>
            </div>
            <div className="mockup-chart-wave">
              <svg className="mockup-wave-svg" viewBox="0 0 300 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="hmsWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M0,35 C60,40 100,15 150,28 C200,38 250,12 300,20 L300,50 L0,50 Z" fill="url(#hmsWave)" />
                <path d="M0,35 C60,40 100,15 150,28 C200,38 250,12 300,20" fill="none" stroke="#0D9488" strokeWidth="2.2" />
              </svg>
            </div>
          </div>
        </div>
      );
    }

    // Default corporate preview for other projects
    return (
      <div className="mockup-preview-screen">
        <div className="mockup-sidebar">
          <div className="mockup-brand">
            <IconComponent size={11} color="#38BDF8" />
            <span>{project.category || 'Portal'}</span>
          </div>
          <div className="mockup-nav-item active">Dashboard</div>
          <div className="mockup-nav-item">Analytics</div>
          <div className="mockup-nav-item">Operations</div>
          <div className="mockup-nav-item">Settings</div>
        </div>
        <div className="mockup-content">
          <div className="mockup-header-title">{project.name}</div>
          <div className="mockup-generic-grid">
            <div className="mockup-metric-box">
              <div className="mockup-metric-lbl">Status Index</div>
              <div className="mockup-metric-val">{isLive ? 'Active 99.9%' : 'Staging v0.9'}</div>
              <div className="mockup-metric-inc" style={{ color: isLive ? '#10B981' : '#F97316' }}>
                {isLive ? '● Live Production' : '● In Development'}
              </div>
            </div>
            <div className="mockup-metric-box">
              <div className="mockup-metric-lbl">Primary Tech</div>
              <div className="mockup-metric-val" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                {project.technologies?.[0] || 'Modern Web'}
              </div>
              <div className="mockup-metric-lbl" style={{ marginTop: '2px' }}>
                {project.technologies?.[1] || 'Cloud Service'}
              </div>
            </div>
          </div>
          <div className="mockup-chart-wave">
            <svg className="mockup-wave-svg" viewBox="0 0 300 45" preserveAspectRatio="none">
              <path
                d="M0,35 Q75,10 150,30 T300,15"
                fill="none"
                stroke={isLive ? '#0866E8' : '#F97316'}
                strokeWidth="2.2"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const imageSrc = project.previewImage || project.preview_image_url || project.imageUrl || project.image_url;

  return (
    <article className="project-card">
      {/* Top Preview Section with Status Badge */}
      <div className="card-preview-container">
        {imageSrc && !imageError ? (
          <img
            src={imageSrc}
            alt={`${project.name} preview`}
            className="card-preview-image"
            onError={() => setImageError(true)}
          />
        ) : (
          renderPreviewMockup()
        )}

        {/* Status Badge in Top-Right Corner */}
        <div className={`card-status-badge ${isLive ? 'status-live' : 'status-dev'}`}>
          {isLive ? (
            <>
              <Play size={10} fill="currentColor" strokeWidth={0} />
              <span>Live</span>
            </>
          ) : (
            <>
              <Code size={12} strokeWidth={2.4} />
              <span>In Development</span>
            </>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Title & Icon Header with Edit/Delete Actions */}
        <div className="card-title-row">
          <div className="card-title-main">
            <div className="card-project-icon-box">
              <IconComponent size={22} strokeWidth={2.2} />
            </div>

            <div className="card-header-text">
              <h2 className="card-project-name">{project.name}</h2>
            </div>
          </div>

          <div className="card-manage-actions">
            <button
              type="button"
              className="card-action-icon-btn btn-edit-project"
              onClick={() => onEdit && onEdit(project)}
              title={`Edit ${project.name}`}
              aria-label={`Edit ${project.name}`}
            >
              <Pencil size={14} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              className="card-action-icon-btn btn-delete-project"
              onClick={() => onDelete && onDelete(project)}
              title={`Delete ${project.name}`}
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 size={14} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Short Description */}
        <p className="card-description" title={project.description}>
          {project.description}
        </p>

        {/* Tech Stack Badges */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="card-tech-list">
            {project.technologies.map((tech, idx) => (
              <span key={idx} className="tech-badge">
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="card-actions-row">
          {/* Live Project Button */}
          {canOpenLive ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-live-project"
              title={`Open ${project.name} live application`}
            >
              <Play size={10} fill="currentColor" strokeWidth={0} />
              <span>Live Project</span>
              <ExternalLink size={11} strokeWidth={2.5} />
            </a>
          ) : (
            <span
              className="btn-live-project disabled"
              title={!isLive ? 'Project is under development' : 'No live URL configured'}
              aria-disabled="true"
            >
              <Play size={10} fill="currentColor" strokeWidth={0} />
              <span>Live Project</span>
              <ExternalLink size={11} strokeWidth={2.5} />
            </span>
          )}

          {/* Designs Button */}
          {project.figmaUrl ? (
            <a
              href={project.figmaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-design-link"
              title="Open Figma UI/UX Design"
            >
              <FigmaIcon />
              <span>Designs</span>
            </a>
          ) : (
            <span className="btn-design-link disabled" title="No design URL available">
              <FigmaIcon />
              <span>Designs</span>
            </span>
          )}

          {/* Documentation Button */}
          {project.docUrl ? (
            <a
              href={project.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-doc-link"
              title="Open Project Documentation"
            >
              <FileText size={13} color="#0866E8" strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>Documentation</span>
            </a>
          ) : (
            <span className="btn-doc-link disabled" title="No documentation URL available">
              <FileText size={13} color="#94A3B8" strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>Documentation</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
