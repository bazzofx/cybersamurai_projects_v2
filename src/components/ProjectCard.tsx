import React, { useState } from "react";
import { Project } from "../types";
import { BambooFrame } from "./BambooFrame";
import { ExternalLink, Github, Edit2, Trash2, Shield, Eye } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  key?: React.Key;
  isAdmin: boolean;
}

export function ProjectCard({ project, onEdit, onDelete, isAdmin }: ProjectCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  // Map badges to specific styling or symbols
  const badgeIcons: Record<string, string> = {
    "Blue team": "🔵",
    "Red team": "🔴",
    "Training": "🏋️",
    "Games": "🎮"
  };

  return (
    <BambooFrame isFeatured={project.featured} className="h-full min-h-[480px] sm:min-h-[500px] w-full">
      <div className="flex flex-col h-full justify-between space-y-4 w-full h-full">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header metadata row */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              <span>// {project.category.toUpperCase()}</span>
              <span className="text-[12px] opacity-75">{project.date}</span>
            </div>

            {/* Project Title & Badge */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                {project.title}
              </h3>

              {/* Stylized Badge */}
              <span
                className="inline-flex items-center px-1.5 py-0.5 text-[14px] font-mono font-semibold border rounded-xs select-none bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 shrink-0"
                title={`${project.badge} badge`}
              >
                <span className="mr-1 text-[14px]" role="img" aria-label={project.badge}>
                  {badgeIcons[project.badge] || "🛡️"}
                </span>
                {project.badge}
              </span>
            </div>

            {/* Role Metadata */}
            {project.role && (
              <div className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-3 border-l border-neutral-200 dark:border-neutral-800 pl-2">
                {project.role}
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans line-clamp-4">
              {project.description}
            </p>
          </div>

          {/* Project Visual Artifact - Always rendered to preserve consistent layout dimensions */}
          <div className="mt-4 relative aspect-video w-full overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
            {project.image ? (
              project.image.startsWith("data:video/") || project.image.endsWith(".webm") || project.image.includes("video/webm") ? (
                <video
                  src={project.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={project.image}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover animate-fade-in"
                />
              )
            ) : (
              // Beautiful minimal vector placeholder when no image is provided
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-neutral-100/30 dark:bg-neutral-900/30 p-4 select-none">
                <div className="absolute w-16 h-16 rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 animate-spin [animation-duration:80s]" />
                <span className="text-lg opacity-45">🛡️</span>
                <span className="text-[8px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500 uppercase mt-2">// SPEC_COMPLIANT</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Tech Stack and Small Buttons */}
        <div className="space-y-4 pt-2">
          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 border border-neutral-100 dark:border-neutral-900 text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-950/50"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Modern small action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-900/50">
            {/* Left: View Code & Demo */}
            <div className="flex items-center space-x-2">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-mono font-medium tracking-wide uppercase border border-neutral-900 dark:border-neutral-100 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:scale-95 transition-all duration-150 rounded-xs"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Project</span>
                </a>
              )}
              {project.codeUrl && (
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-mono font-medium tracking-wide uppercase border border-neutral-200 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 active:scale-95 transition-all duration-150 rounded-xs"
                >
                  <Github className="w-3 h-3" />
                  <span>Code</span>
                </a>
              )}
            </div>

            {/* Right: Edit & Delete */}
            {isAdmin && (
              <div className="flex items-center space-x-1.5 shrink-0">
                {!isConfirming && (
                  <button
                    onClick={() => onEdit(project)}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-[10px] font-mono font-medium tracking-wide uppercase border border-neutral-200 dark:border-neutral-800 hover:border-neutral-950 dark:hover:border-neutral-100 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 active:scale-95 transition-all duration-150 rounded-xs cursor-pointer"
                    title="Edit Project Details"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
                
                {isConfirming ? (
                  <div className="flex items-center space-x-1 bg-neutral-50 dark:bg-neutral-950 p-0.5 border border-red-200 dark:border-red-900/50 rounded-xs">
                    <button
                      onClick={() => {
                        onDelete(project.id);
                        setIsConfirming(false);
                      }}
                      className="px-1.5 py-0.5 text-[8px] font-mono font-black bg-red-600 hover:bg-red-700 text-white rounded-xs transition-colors cursor-pointer"
                      title="Permanently Delete"
                    >
                      DELETE
                    </button>
                    <button
                      onClick={() => setIsConfirming(false)}
                      className="px-1 py-0.5 text-[8px] font-mono text-neutral-450 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-xs transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-[10px] font-mono font-medium tracking-wide uppercase border border-red-200/50 dark:border-red-900/40 text-red-600 dark:text-red-450 hover:bg-red-50/50 dark:hover:bg-red-950/20 active:scale-95 transition-all duration-150 rounded-xs cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BambooFrame>
  );
}
