import React, { useState, useRef, useEffect } from 'react';
import UserAvatarMenu from '../../../core/components/UserAvatarMenu.jsx';
import profileRepository from '../infrastructure/profileRepository.js';
import { getUserInitials, getAbsolutePhotoUrl } from '../domain/profileModel.js';
import { useI18n } from '../../../core/i18n/presentation/useI18n.js';

export default function ProfileView({
  profile,
  setProfile,
  token,
  onNavigateTab,
  onLogout,
  showToast,
  devicesCount = 2,
  areasCount = 3,
  handleQuickLocate,
  theme,
  toggleTheme,
  subscription,
  onOpenSubscription,
}) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [doctorContact, setDoctorContact] = useState('');
  const [hospitalReference, setHospitalReference] = useState('');
  const [patientDiagnosis, setPatientDiagnosis] = useState('');

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Sincronizar com perfil existente
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setDoctorContact(profile.doctor_contact || 'Dr. Carlos Mendonça • Tel: (11) 98765-4321');
      setHospitalReference(profile.hospital_reference || 'Instituto do Coração (InCor) • Pronto-Socorro 24h');
      setPatientDiagnosis(
        profile.patient_diagnosis ||
          'Paciente cianótico crônico (Síndrome de Eisenmenger). Em caso de síncope, manter deitado, administrar O2 suplementar e acionar o socorro imediatamente.'
      );
    }
  }, [profile]);

  const avatarUrl = getAbsolutePhotoUrl(profile?.photo_url);
  const getInitials = (n) => getUserInitials(n);

  // Upload direto de foto de perfil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (showToast) showToast(t('profile.validImageRequired'));
      return;
    }

    try {
      setIsUploadingPhoto(true);
      if (showToast) showToast(t('profile.uploadingPhoto'));
      const uploadRes = await profileRepository.uploadPhoto(token, file);
      const newPhotoUrl = uploadRes.url;

      const updated = await profileRepository.updateProfile(token, {
        name,
        email,
        phone,
        photo_url: newPhotoUrl,
        doctor_contact: doctorContact,
        hospital_reference: hospitalReference,
        patient_diagnosis: patientDiagnosis,
      });

      setProfile(updated);
      if (showToast) showToast(t('profile.photoSuccess'));
    } catch (err) {
      if (showToast) showToast(`${t('common.error')}: ${err.message}`);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Salvar edições do perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      if (showToast) showToast(t('profile.passwordMismatch'));
      return;
    }

    if (password && password.length < 6) {
      if (showToast) showToast(t('profile.passwordMinLength'));
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        doctor_contact: doctorContact.trim(),
        hospital_reference: hospitalReference.trim(),
        patient_diagnosis: patientDiagnosis.trim(),
      };

      if (password && password.trim().length > 0) {
        payload.password = password.trim();
      }

      const updated = await profileRepository.updateProfile(token, payload);
      setProfile(updated);
      setPassword('');
      setConfirmPassword('');
      if (showToast) showToast(t('profile.saveSuccess'));
    } catch (err) {
      if (showToast) showToast(`${t('common.error')}: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Header Compacto da Página */}
      <div className="page-header">
        <div className="page-title">
          <div className="header-breadcrumbs">
            <button
              type="button"
              className="breadcrumb-home-btn"
              onClick={() => onNavigateTab('dashboard')}
              title={t('common.back')}
            >
              <i className="fa-solid fa-house"></i> {t('nav.dashboard')}
            </button>
            <i className="fa-solid fa-chevron-right breadcrumb-sep"></i>
            <span className="breadcrumb-current">
              <i className="fa-solid fa-user-gear" style={{ color: 'var(--color-primary)' }}></i> {t('profile.caregiverProfile')}
            </span>
          </div>
        </div>

        <div className="page-actions">
          <UserAvatarMenu
            profile={profile}
            onNavigateTab={onNavigateTab}
            onLogout={onLogout}
            onProfileUpdated={setProfile}
            token={token}
            showToast={showToast}
            devicesCount={devicesCount}
            areasCount={areasCount}
            onEmergencySOS={handleQuickLocate}
            theme={theme}
            onToggleTheme={toggleTheme}
            subscription={subscription}
            onOpenSubscription={onOpenSubscription}
          />
        </div>
      </div>

      {/* Conteúdo do Perfil Editável */}
      <main className="tab-content-wrapper">
        <div className="profile-edit-container">
          
          {/* Coluna Lateral: Cartão com Foto e Resumo */}
          <aside className="profile-summary-card">
            <div className="profile-photo-wrapper">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
              />

              <div className="profile-photo-circle">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="profile-photo-img" />
                ) : (
                  <span className="profile-photo-initials">{getInitials(name)}</span>
                )}
              </div>

              <button
                type="button"
                className="btn-upload-overlay"
                onClick={() => fileInputRef.current?.click()}
                title={t('profile.changePhoto')}
                disabled={isUploadingPhoto}
              >
                <i className={`fa-solid ${isUploadingPhoto ? 'fa-spinner fa-spin' : 'fa-camera'}`}></i>
              </button>
            </div>

            <button
              type="button"
              className="btn-change-photo-text"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <span>{isUploadingPhoto ? t('profile.uploadingPhoto') : t('profile.changePhoto')}</span>
            </button>

            <h3 className="profile-card-name">{name || t('profile.caregiverProfile')}</h3>
            <p className="profile-card-email">{email}</p>
            
            <span className="profile-role-badge">
              <i className="fa-solid fa-shield-heart"></i> {t('chat.caregiverBadge')}
            </span>

            <div className="profile-quick-stats">
              <div className="profile-stat-box">
                <i className="fa-solid fa-clock"></i>
                <div>
                  <strong>{devicesCount}</strong>
                  <span>{t('nav.tracker')}</span>
                </div>
              </div>
              <div className="profile-stat-box">
                <i className="fa-solid fa-draw-polygon"></i>
                <div>
                  <strong>{areasCount}</strong>
                  <span>{t('nav.map')}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Formulário Principal de Edição */}
          <section className="profile-form-card">
            <div className="profile-section-header">
              <h3>
                <i className="fa-solid fa-user-pen" style={{ color: 'var(--color-primary)' }}></i>
                {t('profile.personalSection')}
              </h3>
              <p>{t('profile.subtitle')}</p>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              
              {/* Grid: Nome e E-mail */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="prof-name">{t('profile.fullName')}</label>
                  <input
                    id="prof-name"
                    type="text"
                    className="input-control"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="prof-email">{t('profile.email')}</label>
                  <input
                    id="prof-email"
                    type="email"
                    className="input-control"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Telefone / WhatsApp */}
              <div className="form-group">
                <label htmlFor="prof-phone">
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginRight: '6px' }}></i>
                  {t('profile.phone')}
                </label>
                <input
                  id="prof-phone"
                  type="tel"
                  className="input-control"
                  placeholder="Ex: (11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* Seção de Trocar Senha */}
              <div className="profile-password-box">
                <div className="profile-password-header">
                  <div>
                    <strong>
                      <i className="fa-solid fa-lock" style={{ color: 'var(--color-primary)', marginRight: '6px' }}></i>
                      {t('profile.securitySection')}
                    </strong>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      {t('profile.newPassword')}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-toggle-pass-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar senhas' : 'Exibir senhas'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="prof-pass">{t('profile.newPassword')}</label>
                    <input
                      id="prof-pass"
                      type={showPassword ? 'text' : 'password'}
                      className="input-control"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prof-pass-confirm">{t('profile.confirmPassword')}</label>
                    <input
                      id="prof-pass-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className="input-control"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              {/* Seção Protocolo Médico (Eisenmenger) */}
              <div className="profile-medical-section">
                <h4>
                  <i className="fa-solid fa-heart-pulse" style={{ color: 'var(--color-danger)' }}></i>
                  {t('profile.medicalSection')}
                </h4>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="prof-doc">{t('profile.doctorContact')}</label>
                    <input
                      id="prof-doc"
                      type="text"
                      className="input-control"
                      placeholder="Ex: Dr. Carlos Mendonça (11) 98765-4321"
                      value={doctorContact}
                      onChange={(e) => setDoctorContact(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prof-hosp">{t('profile.hospitalRef')}</label>
                    <input
                      id="prof-hosp"
                      type="text"
                      className="input-control"
                      placeholder="Ex: Instituto do Coração (InCor)"
                      value={hospitalReference}
                      onChange={(e) => setHospitalReference(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="prof-diag">{t('profile.diagnosis')}</label>
                  <textarea
                    id="prof-diag"
                    className="input-control"
                    style={{ minHeight: '65px' }}
                    placeholder="Instruções em caso de síncope ou queda..."
                    value={patientDiagnosis}
                    onChange={(e) => setPatientDiagnosis(e.target.value)}
                  />
                </div>
              </div>

              {/* Botão Salvar Alterações */}
              <div className="profile-form-footer">
                <button
                  type="submit"
                  className="btn-save-profile"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>{t('common.saving')}</span>
                    </>
                  ) : (
                    <>
                  <i className="fa-solid fa-check"></i>
                  <span>{t('common.save')}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </section>

        </div>
      </main>
    </>
  );
}
