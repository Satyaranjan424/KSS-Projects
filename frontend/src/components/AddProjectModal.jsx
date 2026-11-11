import React, { useState, useRef, useEffect } from 'react';
import { uploadProjectImage } from '../services/api';
import '../styles/add-project-modal.css';

const POPULAR_SUGGESTIONS = [
  'PHP',
  'React',
  'Node.js',
  'Python',
  'Tailwind',
  'Vue',
  'PostgreSQL',
  'Flutter'
];

const CATEGORIES_LIST = [
  'Healthcare',
  'Education',
  'Enterprise',
  'AI / ML',
  'FinTech',
  'Supply Chain',
  'Retail',
  'Real Estate',
  'Cybersecurity',
  'CleanTech',
  'Web application',
  'Mobile app',
  'E-commerce',
  'Internal tool',
  'Website'
];

// Helper URL & Google Drive Validators
const isUrl = (v) => {
  try {
    const u = new URL(v);
    return /^https?:$/.test(u.protocol);
  } catch {
    return false;
  }
};

const isDrive = (v) => {
  try {
    const h = new URL(v).hostname;
    return h === 'drive.google.com' || h === 'docs.google.com';
  } catch {
    return false;
  }
};

export const AddProjectModal = ({ isOpen, onClose, onSave, project = null }) => {
  const fileInputRef = useRef(null);
  const isEditMode = Boolean(project);

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('live'); // 'live' | 'dev' | 'arch'
  const [thumbnail, setThumbnail] = useState('');
  const [thumbnailName, setThumbnailName] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Tech tags
  const [tech, setTech] = useState([]);
  const [techInput, setTechInput] = useState('');

  // Resources (Google Drive Links)
  const [liveUrl, setLiveUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');

  // Validation errors & field messages
  const [errors, setErrors] = useState({});
  const [fieldSuccess, setFieldSuccess] = useState({});

  // Sync state whenever modal opens or project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setName(project.name || '');
        setCategory(project.category || project.category_name || '');
        setDescription(project.description || '');
        const s = (project.status || 'Live').toLowerCase();
        setStatus(s === 'live' ? 'live' : s === 'archived' ? 'arch' : 'dev');
        const img = project.previewImage || project.preview_image_url || project.image_url || '';
        setThumbnail(img);
        setThumbnailName(img ? (project.image_public_id || 'Current thumbnail') : '');
        setImagePublicId(project.image_public_id || project.imagePublicId || '');
        setTech(Array.isArray(project.technologies) ? [...project.technologies] : []);
        setLiveUrl(project.liveUrl || project.live_url || '');
        setFigmaUrl(project.figmaUrl || project.figma_url || '');
        setDocUrl(project.docUrl || project.documentation_url || '');
      } else {
        setName('');
        setCategory('');
        setDescription('');
        setStatus('live');
        setThumbnail('');
        setThumbnailName('');
        setImagePublicId('');
        setTech([]);
        setLiveUrl('');
        setFigmaUrl('');
        setDocUrl('');
      }
      setErrors({});
      setFieldSuccess({});
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  // Handle tech addition
  const addTechTag = (val) => {
    const trimmed = val.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !tech.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTech((prev) => [...prev, trimmed]);
      setTechInput('');
      setErrors((prev) => {
        const next = { ...prev };
        delete next.tech;
        return next;
      });
    }
  };

  const removeTechTag = (indexToRemove) => {
    setTech((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTechTag(techInput);
    } else if (e.key === 'Backspace' && !techInput && tech.length) {
      setTech((prev) => prev.slice(0, -1));
    }
  };

  // Thumbnail handling with Cloudinary Integration
  const processImageFile = async (file) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setErrors((prev) => ({ ...prev, thumb: 'Use a PNG, JPG or WebP image.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, thumb: 'That file is over 5 MB. Choose a smaller image.' }));
      return;
    }

    setThumbnailName(file.name);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.thumb;
      return next;
    });

    // Instant local preview
    const reader = new FileReader();
    reader.onload = () => {
      setThumbnail(reader.result);
    };
    reader.readAsDataURL(file);

    // Asynchronous upload to Cloudinary via backend FastAPI endpoint
    setIsUploading(true);
    try {
      const res = await uploadProjectImage(file);
      if (res && (res.secure_url || res.url)) {
        const cloudUrl = res.secure_url || res.url;
        setThumbnail(cloudUrl);
        setImagePublicId(res.public_id || '');
      }
    } catch (err) {
      console.warn('Cloudinary upload notification:', err);
      // Retain preview and notify user
      setErrors((prev) => ({ ...prev, thumb: `Upload notice: ${err.message}` }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemoveThumbnail = (e) => {
    e.stopPropagation();
    setThumbnail('');
    setThumbnailName('');
    setImagePublicId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  // Link validation helpers
  const validateLiveLink = (val) => {
    const v = val.trim();
    if (!v) {
      if (status === 'live') {
        setErrors((prev) => ({ ...prev, live: 'Add the live URL, it is required for live projects.' }));
        setFieldSuccess((prev) => ({ ...prev, live: false }));
        return false;
      }
      setErrors((prev) => {
        const next = { ...prev };
        delete next.live;
        return next;
      });
      setFieldSuccess((prev) => ({ ...prev, live: false }));
      return true;
    }
    if (!isUrl(v)) {
      setErrors((prev) => ({ ...prev, live: 'Enter a full link starting with https://' }));
      setFieldSuccess((prev) => ({ ...prev, live: false }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.live;
      return next;
    });
    setFieldSuccess((prev) => ({ ...prev, live: true }));
    return true;
  };

  const validateDriveLink = (key, val) => {
    const v = val.trim();
    if (!v) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setFieldSuccess((prev) => ({ ...prev, [key]: false }));
      return true; // Optional if empty
    }
    if (!isUrl(v)) {
      setErrors((prev) => ({ ...prev, [key]: 'Enter a full link starting with https://' }));
      setFieldSuccess((prev) => ({ ...prev, [key]: false }));
      return false;
    }
    if (!isDrive(v)) {
      setErrors((prev) => ({
        ...prev,
        [key]: 'Paste a Google Drive link (drive.google.com or docs.google.com).'
      }));
      setFieldSuccess((prev) => ({ ...prev, [key]: false }));
      return false;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFieldSuccess((prev) => ({ ...prev, [key]: true }));
    return true;
  };

  // Re-check live link requirement when status changes
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === 'live' && !liveUrl.trim()) {
      setErrors((prev) => ({ ...prev, live: 'Add the live URL, it is required for live projects.' }));
      setFieldSuccess((prev) => ({ ...prev, live: false }));
    } else {
      validateLiveLink(liveUrl);
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Enter a project name.';
    if (!category.trim()) newErrors.cat = 'Select a category.';
    if (!description.trim()) newErrors.desc = 'Write a short description.';

    // Enforce that if a thumbnail was selected, it must have uploaded to Cloudinary
    if (isUploading) {
      newErrors.thumb = 'Thumbnail upload is in progress. Please wait a moment.';
    } else if (thumbnailName && (!imagePublicId || thumbnail.startsWith('data:'))) {
      newErrors.thumb = errors.thumb || 'Thumbnail upload failed. Please remove or re-upload the image before saving.';
    }

    const liveValid = validateLiveLink(liveUrl);
    if (!liveValid) {
      newErrors.live = errors.live || 'Invalid live link';
    }

    const figmaValid = validateDriveLink('figma', figmaUrl);
    if (!figmaValid) newErrors.figma = errors.figma || 'Invalid link';

    const docsValid = validateDriveLink('docs', docUrl);
    if (!docsValid) newErrors.docs = errors.docs || 'Invalid link';

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      // Automatically scroll to the first invalid field
      const firstKey = Object.keys(newErrors)[0];
      const targetEl = document.querySelector(`[data-f="${firstKey}"]`);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Default technology tag to category if user didn't add custom tags
    const finalTech = tech.length > 0 ? tech : [category.trim() || 'General'];

    const statusMap = {
      live: 'Live',
      dev: 'In Development',
      arch: 'Archived'
    };

    const isRemoteImage = Boolean(thumbnail && (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')));
    const effectiveImage = isRemoteImage ? thumbnail : (imagePublicId ? thumbnail : '');

    const newProject = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      status: statusMap[status] || 'Live',
      previewImage: effectiveImage,
      preview_image_url: effectiveImage,
      image_url: effectiveImage,
      image_public_id: imagePublicId || null,
      imagePublicId: imagePublicId || null,
      technologies: finalTech,
      liveUrl: liveUrl.trim(),
      figmaUrl: figmaUrl.trim(),
      docUrl: docUrl.trim(),
      isFeatured: false,
      displayOrder: 0,
      icon: category.toLowerCase().includes('health')
        ? 'heart'
        : category.toLowerCase().includes('educat')
        ? 'graduation-cap'
        : category.toLowerCase().includes('ai')
        ? 'brain'
        : category.toLowerCase().includes('supply') || category.toLowerCase().includes('logist')
        ? 'truck'
        : 'layers',
      createdAt: project?.createdAt || new Date().toISOString().split('T')[0]
    };

    if (isEditMode && project?.id) {
      onSave(project.id, newProject);
    } else {
      onSave(newProject);
    }
    onClose();
  };

  return (
    <div className="apm-overlay" onClick={onClose} role="dialog" aria-labelledby="t">
      <div className="apm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header className="apm-header">
          <div className="ic">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3 9 5-9 5-9-5z" />
              <path d="m3 13 9 5 9-5" />
            </svg>
          </div>
          <div>
            <h1 id="t">{isEditMode ? 'Edit project' : 'Add new project'}</h1>
            <p>{isEditMode ? 'Update project details in the company showcase.' : 'Add a project to the company showcase.'}</p>
          </div>
          <button
            type="button"
            className="apm-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </header>

        {/* Form Body */}
        <form id="f" className="apm-form" onSubmit={handleSubmit} noValidate>
          {/* ==================== Fieldset 1: Project Information ==================== */}
          <fieldset className="apm-fieldset">
            <legend className="apm-legend">Project information</legend>
            <p className="apm-sub">The basics people see first on the showcase.</p>

            <div className="apm-grid">
              {/* Project Name */}
              <div className={`apm-field ${errors.name ? 'invalid' : ''}`} data-f="name">
                <label className="apm-label" htmlFor="name">
                  Project name <span className="apm-req">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Customer Portal"
                  maxLength={80}
                  autoComplete="off"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                />
                <div className="apm-msg">{errors.name}</div>
              </div>

              {/* Category */}
              <div className={`apm-field ${errors.cat ? 'invalid' : ''}`} data-f="cat">
                <label className="apm-label" htmlFor="cat">
                  Category <span className="apm-req">*</span>
                </label>
                <select
                  id="cat"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (errors.cat) setErrors((prev) => ({ ...prev, cat: '' }));
                  }}
                >
                  <option value="">Select category</option>
                  {CATEGORIES_LIST.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="apm-msg">{errors.cat}</div>
              </div>

              {/* Description */}
              <div className={`apm-field full ${errors.desc ? 'invalid' : ''}`} data-f="desc">
                <label className="apm-label" htmlFor="desc">
                  Description <span className="apm-req">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    id="desc"
                    maxLength={250}
                    placeholder="What does it do, and who is it for?"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.desc) setErrors((prev) => ({ ...prev, desc: '' }));
                    }}
                  />
                  <span className="apm-count" id="cnt">
                    {description.length} / 250
                  </span>
                </div>
                <div className="apm-msg">{errors.desc}</div>
              </div>

              {/* Status Segmented Control */}
              <div className="apm-field full">
                <span className="apm-lbl">
                  Status <span className="apm-req">*</span>
                </span>
                <div className="apm-seg" role="radiogroup" aria-label="Project status">
                  <input
                    type="radio"
                    name="status"
                    id="s1"
                    value="live"
                    checked={status === 'live'}
                    onChange={() => handleStatusChange('live')}
                  />
                  <label htmlFor="s1">
                    <i className="apm-dot live"></i>Live
                  </label>

                  <input
                    type="radio"
                    name="status"
                    id="s2"
                    value="dev"
                    checked={status === 'dev'}
                    onChange={() => handleStatusChange('dev')}
                  />
                  <label htmlFor="s2">
                    <i className="apm-dot dev"></i>In development
                  </label>

                  <input
                    type="radio"
                    name="status"
                    id="s3"
                    value="arch"
                    checked={status === 'arch'}
                    onChange={() => handleStatusChange('arch')}
                  />
                  <label htmlFor="s3">
                    <i className="apm-dot arch"></i>Archived
                  </label>
                </div>
              </div>

              {/* Thumbnail Upload Dropzone */}
              <div className={`apm-field full ${errors.thumb ? 'invalid' : ''}`} data-f="thumb">
                <span className="apm-lbl">
                  Thumbnail <span className="apm-req">*</span>
                </span>
                <div
                  className={`apm-drop ${isDragOver ? 'over' : ''}`}
                  id="drop"
                  tabIndex={0}
                  role="button"
                  aria-label="Upload project screenshot"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="apm-thumb" id="thumb">
                    {thumbnail ? (
                      <img alt="Preview" src={thumbnail} />
                    ) : (
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="9" cy="10" r="1.5" />
                        <path d="m21 16-5-5-8 8" />
                      </svg>
                    )}
                  </div>

                  <div className="txt">
                    <strong id="fname">
                      {thumbnailName || 'Drop a screenshot here or browse'}
                    </strong>
                    <small>PNG, JPG or WebP, up to 5 MB. Best at 1920 × 1080 (16:9).</small>
                    {isUploading && (
                      <div className="apm-uploading-banner">
                        <div className="apm-spinner"></div>
                        <span>Uploading to Cloudinary...</span>
                      </div>
                    )}
                    <br />
                    <button
                      type="button"
                      className="apm-btn sm"
                      id="pick"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Choose file
                    </button>{' '}
                    {thumbnail && (
                      <button
                        type="button"
                        className="apm-btn sm"
                        id="rm"
                        onClick={handleRemoveThumbnail}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={handleFileChange}
                />
                <div className="apm-msg">{errors.thumb}</div>
              </div>
            </div>
          </fieldset>

          {/* ==================== Fieldset 2: Technology Stack ==================== */}
          <fieldset className="apm-fieldset">
            <legend className="apm-legend">Technology stack</legend>
            <p className="apm-sub">Type a technology and press Enter, or pick a suggestion.</p>

            <div className={`apm-field ${errors.tech ? 'invalid' : ''}`} data-f="tech">
              <label className="apm-label" htmlFor="ti">
                Technologies used <span className="apm-req">*</span>
              </label>

              <div
                className="apm-tags"
                id="tags"
                onClick={() => document.getElementById('ti')?.focus()}
              >
                {tech.map((t, idx) => (
                  <span key={t} className="apm-chip">
                    {t}
                    <button
                      type="button"
                      aria-label={`Remove ${t}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTechTag(idx);
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="ti"
                  type="text"
                  placeholder="Add technology (e.g. PHP, React, Python)"
                  autoComplete="off"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechKeyDown}
                  onBlur={() => {
                    if (techInput.trim()) addTechTag(techInput);
                  }}
                />
              </div>

              {/* Popular Suggestions */}
              <div className="apm-sugg" id="sugg">
                <span>Popular:</span>
                {POPULAR_SUGGESTIONS.filter(
                  (p) => !tech.some((t) => t.toLowerCase() === p.toLowerCase())
                ).map((p) => (
                  <button key={p} type="button" onClick={() => addTechTag(p)}>
                    + {p}
                  </button>
                ))}
              </div>
              <div className="apm-msg">{errors.tech}</div>
            </div>
          </fieldset>

          {/* ==================== Fieldset 3: Project Resources ==================== */}
          <fieldset className="apm-fieldset">
            <legend className="apm-legend">Project resources</legend>
            <p className="apm-sub">Link to the live site and to files stored in Google Drive.</p>

            <div className="apm-grid">
              {/* Live Project URL */}
              <div
                className={`apm-field full ${errors.live ? 'invalid' : fieldSuccess.live ? 'ok' : ''}`}
                data-f="live"
              >
                <label className="apm-label" htmlFor="live">
                  Live project URL{' '}
                  <span className={`apm-pill ${status !== 'live' ? 'off' : ''}`} id="lp">
                    {status === 'live' ? 'Required' : 'Optional'}
                  </span>
                </label>
                <div className="apm-lead">
                  <svg
                    className="lead-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                  </svg>
                  <input
                    id="live"
                    type="url"
                    placeholder="https://yourproject.com"
                    autoComplete="off"
                    value={liveUrl}
                    onChange={(e) => {
                      setLiveUrl(e.target.value);
                      validateLiveLink(e.target.value);
                    }}
                  />
                  <svg
                    className="apm-state"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                </div>
                <div className="apm-msg">
                  {errors.live || (fieldSuccess.live && 'Link looks good')}
                </div>
              </div>

              {/* Figma Design (Google Drive link) */}
              <div
                className={`apm-field ${errors.figma ? 'invalid' : fieldSuccess.figma ? 'ok' : ''}`}
                data-f="figma"
              >
                <label className="apm-label" htmlFor="figma">
                  Figma design <span className="apm-opt">(Google Drive link)</span>
                </label>
                <div className="apm-lead">
                  <svg
                    className="lead-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                  </svg>
                  <input
                    id="figma"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    autoComplete="off"
                    value={figmaUrl}
                    onChange={(e) => {
                      setFigmaUrl(e.target.value);
                      validateDriveLink('figma', e.target.value);
                    }}
                  />
                  <svg
                    className="apm-state"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                </div>
                <div className="apm-msg">
                  {errors.figma || (fieldSuccess.figma && 'Google Drive link added')}
                </div>
              </div>

              {/* Documentation (Google Drive link) */}
              <div
                className={`apm-field ${errors.docs ? 'invalid' : fieldSuccess.docs ? 'ok' : ''}`}
                data-f="docs"
              >
                <label className="apm-label" htmlFor="docs">
                  Documentation <span className="apm-opt">(Google Drive link)</span>
                </label>
                <div className="apm-lead">
                  <svg
                    className="lead-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
                  </svg>
                  <input
                    id="docs"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    autoComplete="off"
                    value={docUrl}
                    onChange={(e) => {
                      setDocUrl(e.target.value);
                      validateDriveLink('docs', e.target.value);
                    }}
                  />
                  <svg
                    className="apm-state"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5 9-9" />
                  </svg>
                </div>
                <div className="apm-msg">
                  {errors.docs || (fieldSuccess.docs && 'Google Drive link added')}
                </div>
              </div>
            </div>

            {/* Google Drive Tip Banner */}
            <div className="apm-tip">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8h.01M11 12h1v5h1" />
              </svg>
              <span>
                Before pasting a Drive link, set sharing to{' '}
                <b>“Anyone with the link can view”</b> so your team can open it.
              </span>
            </div>
          </fieldset>

          {/* ==================== Footer ==================== */}
          <footer className="apm-footer">
            <span>
              <span className="apm-req">*</span> Required
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="apm-btn" id="cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="apm-btn primary"
                id="save"
                disabled={isUploading}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
                {isUploading ? 'Uploading Image...' : (isEditMode ? 'Save changes' : 'Save project')}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};
