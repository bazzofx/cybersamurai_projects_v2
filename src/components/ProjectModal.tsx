import React, { useState, useEffect } from "react";
import { Project } from "../types";
import { motion } from "motion/react";
import { X, Save, Plus, Trash, Upload, Image, Film } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  projectToEdit?: Project | null;
}

const BADGES: Project["badge"][] = ["Red Team", "Blue Team", "Automation", "Cyber Games", "Architecture"];

export function ProjectModal({ isOpen, onClose, onSave, projectToEdit }: ProjectModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [role, setRole] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [codeUrl, setCodeUrl] = useState("");
  const [badge, setBadge] = useState<Project["badge"]>("Cyber Games");
  const [techInput, setTechInput] = useState("");
  const [techList, setTechList] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Sync state if editing
  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setRole(projectToEdit.role);
      setDemoUrl(projectToEdit.demoUrl);
      setCodeUrl(projectToEdit.codeUrl);
      setBadge(projectToEdit.badge);
      setTechList(projectToEdit.tech);
      setTechInput("");
      setFeatured(projectToEdit.featured);
      setDate(projectToEdit.date || "Spring 1590");
      setImage(projectToEdit.image || "");
      setUploadError("");
    } else {
      // Clear forms for new project
      setTitle("");
      setDescription("");
      setCategory("");
      setRole("Solo Developer");
      setDemoUrl("https://");
      setCodeUrl("https://github.com/");
      setBadge("Cyber Games");
      setTechList(["React", "TypeScript", "Tailwind CSS"]);
      setTechInput("");
      setFeatured(false);
      setDate("Summer 1590");
      setImage("");
      setUploadError("");
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    setUploadError("");
    const validExtensions = ['.gif', '.png', '.jpeg', '.jpg', '.webm', '.svg'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      setUploadError("Invalid file type. Allowed formats: .gif, .png, .jpeg, .jpg, .webm, .svg");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size is too large. Limit is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
      }
    };
    reader.onerror = () => {
      setUploadError("Error reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !techList.includes(trimmed)) {
      setTechList([...techList, trimmed]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (indexToRemove: number) => {
    setTechList(techList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;

    const savedProject: Project = {
      id: projectToEdit ? projectToEdit.id : `project-${Date.now()}`,
      title,
      description,
      category,
      role,
      demoUrl,
      codeUrl,
      badge,
      tech: techList,
      featured,
      date,
      image
    };

    onSave(savedProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 20, stiffness: 120 }}
        className="relative w-full max-w-2xl bg-white dark:bg-black border-2 border-neutral-900 dark:border-neutral-100 p-6 md:p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh] text-neutral-900 dark:text-neutral-100"
      >
        {/* Header decoration: Ink splatter line */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
              {projectToEdit ? "// UPDATE SHINOBI WORK" : "// FORGE NEW PROJECT"}
            </span>
            <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight">
              {projectToEdit ? "Edit Application" : "Enlist Project"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Title and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Katana.js"
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2.5 outline-none rounded-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Fullstack, Web App, AI Agent"
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2.5 outline-none rounded-none transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Role and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Developer Role / Responsibility
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead UI Artist, Solo Creator"
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2.5 outline-none rounded-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Date / Period of Creation
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Summer 1590, Dec 2025"
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2.5 outline-none rounded-none transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Samurai Badge Presets */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
              Honorary Rank Badge
            </label>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBadge(b)}
                  className={`px-3 py-1.5 text-xs font-mono border transition-all cursor-pointer ${
                    badge === b
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-black"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-400 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
              Project Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the application's purpose, design craftsmanship, and performance objectives..."
              className="w-full text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2.5 outline-none rounded-none transition-colors resize-none font-sans"
            />
          </div>

          {/* Project Visual Artifact Upload Area */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
              Project Visual Artifact (Optional)
            </label>
            
            {image ? (
              <div className="relative border border-neutral-200 dark:border-neutral-800 p-2.5 bg-neutral-50 dark:bg-neutral-950/40">
                <div className="relative aspect-video w-full overflow-hidden border border-neutral-150 dark:border-neutral-900 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                  {image.startsWith("data:video/") || image.endsWith(".webm") || image.includes("video/webm") ? (
                    <video
                      src={image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <img
                      src={image}
                      alt="Project Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                  
                  {/* Absolute overlay indicator */}
                  <div className="absolute top-2.5 left-2.5 bg-neutral-950/80 text-white dark:bg-neutral-900/95 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase">
                    {image.startsWith("data:video/") ? "WEBM CAPTURE" : "IMAGE CAPTURE"}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">// Visual successfully loaded</span>
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[10px] font-mono text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-250 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-xs transition-colors cursor-pointer"
                  >
                    <Trash className="w-3 h-3" />
                    <span>DISCARD VISUAL</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed p-6 text-center transition-all duration-250 flex flex-col items-center justify-center min-h-[140px] rounded-none ${
                  isDragging
                    ? "border-neutral-900 bg-neutral-100/50 dark:border-white dark:bg-neutral-900/30"
                    : "border-neutral-300 hover:border-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-450 bg-neutral-50/20 dark:bg-neutral-950/10"
                }`}
              >
                <input
                  type="file"
                  id="project-image-upload"
                  accept=".gif,.png,.jpeg,.jpg,.webm,.svg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="project-image-upload"
                  className="cursor-pointer w-full h-full absolute inset-0 z-10"
                />
                
                <div className="relative z-0 flex flex-col items-center space-y-2 pointer-events-none">
                  <div className="w-10 h-10 border border-neutral-300 dark:border-neutral-800 rounded-full flex items-center justify-center bg-white dark:bg-black">
                    <Upload className="w-4 h-4 text-neutral-450 dark:text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Drag & Drop or <span className="underline font-bold text-neutral-900 dark:text-white">Browse</span>
                    </p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans mt-1">
                      Supports .gif, .png, .jpeg, .jpg, .webm, .svg (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {uploadError && (
              <p className="text-[10px] font-mono text-red-600 dark:text-red-400 uppercase tracking-wide mt-1 animate-pulse">
                {uploadError}
              </p>
            )}
          </div>

          {/* Technology Stack Tags */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
              Technology Stack
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="Press Enter or click + to add"
                className="flex-1 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2 outline-none rounded-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 border border-neutral-900 dark:border-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Active tags display */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-900">
              {techList.length === 0 ? (
                <span className="text-[11px] text-neutral-400 italic">No technologies added yet.</span>
              ) : (
                techList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-neutral-700 dark:text-neutral-300"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(idx)}
                      className="text-neutral-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Links: Demo and GitHub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Live Deployment Link
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://my-app.com"
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2.5 outline-none rounded-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">
                Repository/Source URL
              </label>
              <input
                type="url"
                value={codeUrl}
                onChange={(e) => setCodeUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-950 dark:focus:border-neutral-200 p-2.5 outline-none rounded-none transition-colors"
              />
            </div>
          </div>

          {/* Featured Toggle Option */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded-none border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="featured"
              className="text-xs font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-300 cursor-pointer"
            >
              Pin as Featured Project (adds to Supreme Showcase Carousel)
            </label>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-5 py-2 text-xs font-mono uppercase tracking-wider border border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-150 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Forge Changes</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
