import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Building2,
  Camera,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { api } from '../../Services/api'
import { updateUser } from '../../Redux/Userslice'
import { useAdminContext } from '../../context/AdminContext'
import AddressMap from '../common/AddressMap'

export default function ProfilePanel() {
  const dispatch = useDispatch()
  const { owner, activeLibrary, libraryId } = useAdminContext()

  const [libraries, setLibraries] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const currentAddress = owner?.address || owner?.userlocation || activeLibrary?.address || ''
  const currentLat = owner?.latitude ?? activeLibrary?.latitude ?? null
  const currentLng = owner?.longitude ?? activeLibrary?.longitude ?? null

  const [formData, setFormData] = useState(() => ({
    name: owner?.name || '',
    phone: owner?.phone || '',
    email: owner?.email || '',
    address: currentAddress,
    latitude: currentLat,
    longitude: currentLng,
  }))
  const [addressQuery, setAddressQuery] = useState(currentAddress)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Sync state when owner or activeLibrary updates from context
  useEffect(() => {
    if (!isEditing && owner) {
      const addr = owner?.address || owner?.userlocation || activeLibrary?.address || ''
      setAddressQuery(addr)
      setFormData((prev) => ({
        ...prev,
        name: owner?.name || '',
        phone: owner?.phone || '',
        email: owner?.email || '',
        address: addr,
        latitude: owner?.latitude ?? activeLibrary?.latitude ?? null,
        longitude: owner?.longitude ?? activeLibrary?.longitude ?? null,
      }))
    }
  }, [owner, activeLibrary, isEditing])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Storj Profile Picture Upload state
  const fileInputRef = useRef(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [previewPhoto, setPreviewPhoto] = useState(null)

  async function handleImageFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2 MB.')
      return
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).')
      return
    }

    try {
      setUploadingPhoto(true)
      setError('')
      setSuccessMsg('')

      // Optimistic preview
      const localUrl = URL.createObjectURL(file)
      setPreviewPhoto(localUrl)

      const uploadData = new FormData()
      uploadData.append('file', file)

      const res = await api.post('/update-profile-pic', uploadData)

      if (res?.url) {
        setPreviewPhoto(res.url)
        if (res.owner) {
          dispatch(updateUser(res.owner))
        } else {
          dispatch(updateUser({ avatar_url: res.url }))
        }
        setSuccessMsg('Profile picture uploaded successfully to Storj!')
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (uploadErr) {
      console.error('Failed to upload image to Storj:', uploadErr)
      setError(uploadErr.message || 'Failed to upload image. Please try again.')
      setPreviewPhoto(null)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Fetch owner's managed libraries and active subscription
  useEffect(() => {
    let isMounted = true

    async function loadOwnerInfo() {
      try {
        setLoading(true)
        const [libsData, subData] = await Promise.allSettled([
          api.get('/libraries'),
          api.get('/subscription'),
        ])

        if (isMounted) {
          if (libsData.status === 'fulfilled' && Array.isArray(libsData.value)) {
            setLibraries(libsData.value)
          }
          if (subData.status === 'fulfilled' && subData.value) {
            setSubscription(subData.value)
          }
        }
      } catch (err) {
        console.error('Failed to load profile details:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadOwnerInfo()

    return () => {
      isMounted = false
    }
  }, [])

  function handleAddressInputChange(val) {
    setAddressQuery(val)
    setFormData((prev) => ({ ...prev, address: val }))
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    if (!val || val.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setLoadingSuggestions(true)
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&limit=5`
        )
        const data = await response.json()
        if (data?.features) {
          setSuggestions(data.features)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
      } catch (err) {
        console.error('Photon address fetch error:', err)
      } finally {
        setLoadingSuggestions(false)
      }
    }, 280)
  }

  function handleSelectSuggestion(feature) {
    const [lng, lat] = feature.geometry.coordinates
    const p = feature.properties || {}
    const parts = [
      p.name,
      p.street,
      p.city || p.town || p.village,
      p.state,
      p.country,
    ].filter(Boolean)
    const formattedAddress = Array.from(new Set(parts)).join(', ') || p.name || 'Selected Location'

    setFormData((prev) => ({
      ...prev,
      address: formattedAddress,
      latitude: lat,
      longitude: lng,
    }))
    setAddressQuery(formattedAddress)
    setSuggestions([])
    setShowSuggestions(false)
  }

  function handleStartEdit() {
    setError('')
    setSuccessMsg('')
    const addr = owner?.address || owner?.userlocation || activeLibrary?.address || ''
    const lat = owner?.latitude ?? activeLibrary?.latitude ?? null
    const lng = owner?.longitude ?? activeLibrary?.longitude ?? null

    setFormData({
      name: owner?.name || '',
      phone: owner?.phone || '',
      email: owner?.email || '',
      address: addr,
      latitude: lat,
      longitude: lng,
    })
    setAddressQuery(addr)
    setSuggestions([])
    setShowSuggestions(false)
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setError('')
    setShowSuggestions(false)
    setIsEditing(false)
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Full name cannot be blank.')
      return
    }
    if (!formData.email.trim()) {
      setError('Email address cannot be blank.')
      return
    }

    try {
      setSaving(true)
      setError('')
      const res = await api.put('/updateownerdata', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        userlocation: formData.address.trim(),
        library_id: libraryId ? Number(libraryId) : undefined,
      })

      if (res?.owner) {
        dispatch(updateUser(res.owner))
      }

      // Update local storage active library address & coordinates if present
      if (activeLibrary && formData.address) {
        const updatedLib = {
          ...activeLibrary,
          address: formData.address.trim(),
          latitude: formData.latitude,
          longitude: formData.longitude,
        }
        localStorage.setItem('activeLibrary', JSON.stringify(updatedLib))
      }

      setSuccessMsg('Profile and location updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Update profile error:', err)
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // PDF & CSV Export state and handlers
  const [exportingPdf, setExportingPdf] = useState(false)

  function handleDownloadCSV() {
    try {
      const now = new Date()
      const timestamp = now.toLocaleString()
      const filenameDate = now.toISOString().split('T')[0]

      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""'
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      }

      const rows = [
        ['Category', 'Field', 'Value'],
        ['Owner Profile', 'Full Name', owner?.name || 'Library Owner'],
        ['Owner Profile', 'Email Address', owner?.email || '—'],
        ['Owner Profile', 'Phone Number', owner?.phone || '—'],
        ['Owner Profile', 'Nationality', 'Indian'],
        ['Owner Profile', 'Address', owner?.address || owner?.userlocation || activeLibrary?.address || '—'],
        ['Owner Profile', 'Account Status', 'Verified Owner'],
        ['Owner Profile', 'Subscription Plan', subscriptionPlan],
        ['Owner Profile', 'Total Managed Libraries', totalLibrariesCount],
        ['Owner Profile', 'Report Export Date', timestamp],
        ['', '', ''],
        ['Managed Libraries', 'Library Name', 'Address', 'Status'],
      ]

      if (libraries.length > 0) {
        libraries.forEach((lib) => {
          const isCurrent = String(lib.id) === String(libraryId)
          rows.push([
            'Managed Libraries',
            lib.name || 'Unnamed Library',
            lib.address || 'Address not specified',
            isCurrent ? 'Current Active Workspace' : 'Active',
          ])
        })
      } else {
        rows.push([
          'Managed Libraries',
          activeLibrary?.name || 'Current Library',
          activeLibrary?.address || '—',
          'Current Active Workspace',
        ])
      }

      const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `LibraryHub_Profile_${filenameDate}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setSuccessMsg('Profile downloaded in CSV format!')
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch (err) {
      console.error('Failed to export CSV:', err)
      setError('Failed to generate CSV export.')
    }
  }

  async function handleDownloadPDF() {
    try {
      setExportingPdf(true)
      setError('')

      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ format: 'a4', unit: 'mm' })
      const now = new Date()
      const dateStr = now.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      const filenameDate = now.toISOString().split('T')[0]

      // Dark Banner Header
      doc.setFillColor(20, 22, 27)
      doc.rect(0, 0, 210, 32, 'F')

      // Brand Logo / Accent text
      doc.setTextColor(213, 244, 119) // #d5f477
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('LIBRARYHUB', 15, 14)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Owner Profile & Workspace Summary', 15, 22)

      doc.setTextColor(170, 175, 185)
      doc.setFontSize(8)
      doc.text(`Generated: ${dateStr}`, 155, 22)

      // Section 1: Personal & Account Details
      let y = 43
      doc.setTextColor(30, 35, 45)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('1. Personal & Account Details', 15, y)
      y += 6

      const profileDetails = [
        ['Full Name', owner?.name || 'Library Owner'],
        ['Email Address', owner?.email || '—'],
        ['Phone Number', owner?.phone || '—'],
        ['Nationality', 'Indian'],
        ['Address', owner?.address || owner?.userlocation || activeLibrary?.address || 'Location not specified'],
        ['Account Status', 'Verified Owner'],
        ['Subscription Plan', subscriptionPlan],
        ['Total Libraries', `${totalLibrariesCount} ${totalLibrariesCount === 1 ? 'Library' : 'Libraries'}`],
      ]

      profileDetails.forEach(([label, value], i) => {
        if (i % 2 === 0) {
          doc.setFillColor(247, 248, 250)
          doc.rect(15, y - 4, 180, 7.5, 'F')
        }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(90, 95, 105)
        doc.text(label, 18, y + 1)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(25, 30, 38)
        const maxLen = 65
        const displayVal = String(value).length > maxLen ? String(value).slice(0, maxLen - 3) + '...' : String(value)
        doc.text(displayVal, 75, y + 1)
        y += 7.5
      })

      // Section 2: Managed Libraries
      y += 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(30, 35, 45)
      doc.text('2. Managed Libraries', 15, y)
      y += 6

      // Table Header
      doc.setFillColor(232, 236, 242)
      doc.rect(15, y - 4, 180, 7.5, 'F')
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(70, 75, 85)
      doc.text('Library Name', 18, y + 1)
      doc.text('Address / Location', 85, y + 1)
      doc.text('Workspace Status', 155, y + 1)
      y += 8

      const libItems = libraries.length > 0 ? libraries : [activeLibrary || { name: 'Main Library', address: '—' }]

      libItems.slice(0, 10).forEach((lib, i) => {
        const isCurrent = String(lib?.id) === String(libraryId)
        if (i % 2 === 1) {
          doc.setFillColor(247, 248, 250)
          doc.rect(15, y - 4, 180, 7.5, 'F')
        }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(25, 30, 38)

        const libName = String(lib?.name || 'Unnamed Library').slice(0, 35)
        const libAddr = String(lib?.address || 'Address not specified').slice(0, 38)

        doc.text(libName, 18, y + 1)
        doc.text(libAddr, 85, y + 1)

        if (isCurrent) {
          doc.setTextColor(22, 163, 74)
          doc.setFont('helvetica', 'bold')
          doc.text('Current Active', 155, y + 1)
        } else {
          doc.setTextColor(100, 105, 115)
          doc.text('Active', 155, y + 1)
        }
        y += 7.5
      })

      // Footer
      doc.setDrawColor(220, 225, 230)
      doc.line(15, 278, 195, 278)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(140, 145, 155)
      doc.text('LibraryHub Management System — Confidential Profile Report', 15, 283)
      doc.text('Page 1 of 1', 178, 283)

      doc.save(`LibraryHub_Profile_${filenameDate}.pdf`)
      setSuccessMsg('Profile downloaded in PDF format!')
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      setError(err.message || 'Failed to generate PDF export.')
    } finally {
      setExportingPdf(false)
    }
  }

  // Dummy fallback avatar
  const defaultPhotoUrl =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'

  const currentPhotoUrl = previewPhoto || owner?.avatar_url || defaultPhotoUrl
  const totalLibrariesCount = libraries.length > 0 ? libraries.length : 1
  const subscriptionPlan =
    subscription?.subscription_type ||
    subscription?.subscription?.subscription_type ||
    'Pro Member'

  return (
    <div className="max-w-2xl space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Hidden file input for Storj avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Success notification */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 flex items-center justify-between animate-in fade-in">
          <span>{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="text-emerald-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 flex items-center justify-between animate-in fade-in">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-red-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Profile Header with subtle dark checkered backdrop matching reference design */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-[#0f1115] p-6 sm:p-7 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        {/* Subtle grid pattern background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex flex-col items-start gap-3">
          {/* Circular Avatar with Storj upload trigger on hover */}
          <div className="relative group">
            <img
              src={currentPhotoUrl}
              alt={owner?.name || 'Owner Profile'}
              className="h-24 w-24 sm:h-26 sm:w-26 rounded-full object-cover ring-2 ring-white/10 shadow-2xl bg-neutral-900 transition group-hover:ring-[#d5f477]/50"
            />

            {/* Uploading loading overlay */}
            {uploadingPhoto ? (
              <div className="absolute inset-0 rounded-full bg-black/80 flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <Loader2 size={22} className="animate-spin text-[#d5f477]" />
                <span className="text-[10px] font-medium mt-1 text-neutral-300">Uploading...</span>
              </div>
            ) : (
              /* Hover overlay to trigger file upload to Storj */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change profile picture"
                aria-label="Change profile picture"
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer backdrop-blur-xs"
              >
                <Camera size={20} className="text-[#d5f477] drop-shadow" />
                <span className="text-[10px] font-semibold mt-0.5 text-white drop-shadow">Change</span>
              </button>
            )}
          </div>

          <div className="pt-0.5">
            {/* Owner Full Name with Official Blue Scalloped Verified Badge */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white">
                {owner?.name || 'Library Owner'}
              </h1>
              <span title="Verified Account" className="inline-flex items-center shrink-0">
                <svg className="w-5 h-5 drop-shadow-sm" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#1d9bf0"
                    d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12z"
                  />
                  <path
                    fill="#ffffff"
                    d="M10.09 15.59L6.5 12l1.41-1.41 2.18 2.18 5.66-5.66 1.41 1.41-7.07 7.07z"
                  />
                </svg>
              </span>
            </div>
            {/* Subdued Email Address */}
            <p className="text-sm text-neutral-400 mt-0.5">
              {owner?.email || 'owner@libraryhub.com'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Details Card (Pixel-accurate to Reference Image with subtle dashed rows) */}
      <section className="rounded-2xl p-5 border border-white/[0.08] bg-[#121418] shadow-[0_4px_24px_rgba(0,0,0,0.35)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.08] px-6 py-4">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-300">Personal details</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={exportingPdf}
              title="Download Profile as PDF document"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition cursor-pointer disabled:opacity-50"
            >
              <FileText size={13} />
              <span>{exportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadCSV}
              title="Download Profile as CSV spreadsheet"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 transition cursor-pointer"
            >
              <FileSpreadsheet size={13} />
              <span>Download CSV</span>
            </button>
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Pencil size={12} />
                <span>Edit info</span>
              </button>
            ) : (
              <span className="text-xs text-[#d5f477] font-medium">Editing mode</span>
            )}
          </div>
        </div>

        {isEditing ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#191c22] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#191c22] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#191c22] px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="relative" ref={suggestionsRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-400">
                  Library Address / Location
                </label>
                <span className="text-[10px] text-neutral-500">Photon (OSM) Suggestions</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={addressQuery}
                  onChange={(e) => handleAddressInputChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#191c22] pl-3.5 pr-9 py-2.5 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
                  placeholder="Type address or city (e.g. Kanpur, MG Road)..."
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  {loadingSuggestions ? (
                    <Loader2 size={15} className="animate-spin text-[#d5f477]" />
                  ) : (
                    <MapPin size={15} />
                  )}
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-[#16181e] shadow-2xl z-50 divide-y divide-white/5">
                  {suggestions.map((feature, idx) => {
                    const p = feature.properties || {}
                    const title = p.name || 'Unnamed Location'
                    const subtitle = [
                      p.street,
                      p.city || p.town || p.village,
                      p.state,
                      p.country,
                    ]
                      .filter(Boolean)
                      .join(', ')

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(feature)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-white/5 transition flex items-start gap-2.5 cursor-pointer text-xs"
                      >
                        <MapPin size={14} className="text-[#d5f477] shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{title}</p>
                          {subtitle && (
                            <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {subtitle}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Live Leaflet Map Preview */}
              {formData.latitude != null && formData.longitude != null && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1.5 text-[#d5f477] font-medium">
                      <MapPin size={12} />
                      <span>
                        Coordinates: {Number(formData.latitude).toFixed(4)},{' '}
                        {Number(formData.longitude).toFixed(4)}
                      </span>
                    </span>
                    <span className="text-[10px] text-neutral-500">Leaflet &bull; OpenStreetMap</span>
                  </div>
                  <AddressMap lat={Number(formData.latitude)} lng={Number(formData.longitude)} height="220px" />
                </div>
              )}
            </div>

            {/* Profile photo trigger in edit form */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#16181d] p-3">
              <div className="flex items-center gap-2.5">
                <Camera size={16} className="text-[#d5f477]" />
                <div>
                  <p className="text-xs font-semibold text-white">Profile Picture</p>
                  <p className="text-[11px] text-neutral-400">Stored decentralized on Storj (max 2MB)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition cursor-pointer"
              >
                {uploadingPhoto ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-[#d5f477]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera size={12} />
                    <span>Upload photo</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#d5f477] px-4 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-[#c5e662] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save changes</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* VIEW MODE (Matches reference design with dashed dividers and clean two-column grid) */
          <div>
            {/* Full Name */}
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] items-center px-6 py-3.5 border-b border-dashed border-[#23262e]">
              <span className="text-sm text-[#848892]">Full name:</span>
              <span className="text-sm text-[#eaeaea] font-medium">
                {owner?.name || 'Emily Johnson'}
              </span>
            </div>

            {/* Nationality */}
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] items-center px-6 py-3.5 border-b border-dashed border-[#23262e]">
              <span className="text-sm text-[#848892]">Nationality:</span>
              <span className="text-sm text-[#eaeaea]">
                Indian
              </span>
            </div>

            {/* Address */}
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] items-start px-6 py-3.5 border-b border-dashed border-[#23262e]">
              <span className="text-sm text-[#848892] pt-0.5">Address:</span>
              <div className="space-y-2">
                <span className="text-sm text-[#eaeaea] flex items-center gap-2">
                  <MapPin size={14} className="text-[#d5f477] shrink-0" />
                  <span>
                    {owner?.address || owner?.userlocation || activeLibrary?.address || 'Location not set'}
                  </span>
                </span>
                {currentLat != null && currentLng != null && (
                  <div className="pt-1">
                    <AddressMap lat={Number(currentLat)} lng={Number(currentLng)} height="200px" />
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] items-center px-6 py-3.5 border-b border-dashed border-[#23262e]">
              <span className="text-sm text-[#848892]">Phone Number:</span>
              <span className="text-sm text-[#eaeaea]">
                {owner?.phone || '(213) 555-1234'}
              </span>
            </div>

            {/* Email */}
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] items-center px-6 py-3.5 border-b border-dashed border-[#23262e]">
              <span className="text-sm text-[#848892]">Email:</span>
              <span className="text-sm text-[#eaeaea]">
                {owner?.email || 'johnson@example.com'}
              </span>
            </div>

            {/* Total Libraries */}
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] items-center px-6 py-3.5 border-b border-dashed border-[#23262e]">
              <span className="text-sm text-[#848892]">Total Libraries:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#d5f477] font-semibold">
                  {totalLibrariesCount} {totalLibrariesCount === 1 ? 'Library' : 'Libraries'}
                </span>
                <span className="text-xs text-neutral-400">across system</span>
              </div>
            </div>

            {/* Account Status / Plan */}
            <div className="grid grid-cols-[130px_1fr] sm:grid-cols-[170px_1fr] items-center px-6 py-3.5">
              <span className="text-sm text-[#848892]">Plan:</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d5f477]/10 border border-[#d5f477]/30 px-2.5 py-0.5 text-xs font-semibold text-[#d5f477]">
                  <ShieldCheck size={13} />
                  <span>Verified Owner</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                  <Sparkles size={12} />
                  <span>{subscriptionPlan}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Managed Libraries Workspace Section */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#14161b] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 mb-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-200">Managed Libraries</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Workspaces owned and configured by your account
            </p>
          </div>
          <Link
            to="/create-library"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#d5f477] hover:bg-[#d5f477]/10 transition"
          >
            <span>+ New library</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-neutral-400">Loading libraries...</div>
        ) : libraries.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            No libraries found. Create your first library workspace.
          </div>
        ) : (
          <div className="space-y-2.5">
            {libraries.map((lib) => {
              const isActive = String(lib.id) === String(libraryId)
              return (
                <div
                  key={lib.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                    isActive
                      ? 'border-[#d5f477]/40 bg-[#d5f477]/5'
                      : 'border-white/5 bg-[#181a20] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-[#d5f477]">
                      <Building2 size={17} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{lib.name}</p>
                        {isActive && (
                          <span className="rounded-full bg-[#d5f477]/20 border border-[#d5f477]/40 px-2 py-0.2 text-[10px] font-bold text-[#d5f477]">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {lib.address || 'Address not specified'}
                      </p>
                    </div>
                  </div>

                  {!isActive && (
                    <Link
                      to={`/admin?library_id=${encodeURIComponent(lib.id)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition shrink-0"
                    >
                      <span>Switch</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
