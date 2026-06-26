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
    "Red Team": "🔴",
    "Blue Team": "🔵",
    Automation: "🤖",
    "Cyber Games": "🎮",
    Architecture: "🏛️"
  };

  return (
    <BambooFrame isFeatured={project.featured}>
      <div className="flex flex-col h-full justify-between space-y-4">
        <div>
          {/* Header metadata row */}
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
            <span>// {project.category.toUpperCase()}</span>
            <span className="text-[10px] opacity-75">{project.date}</span>
          </div>

          {/* Project Title & Badge */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-display text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-black dark:group-hover:text-white transition-colors">
              {project.title}
            </h3>

            {/* Stylized Badge */}
            <span
              className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-semibold border rounded-xs select-none bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800"
              title={`${project.badge} rank badge`}
            >
              <span className="mr-1 text-[10px]" role="img" aria-label={project.badge}>
                {badgeIcons[project.badge] || "⚔️"}
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

          {/* Project Visual Artifact */}
          {project.image && (
            <div className="mt-3.5 relative aspect-video w-full overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
              {project.image.startsWith("data:video/") || project.image.endsWith(".webm") || project.image.includes("video/webm") ? (
                <video
                  src={project.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <img
                  src={project.image}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain animate-fade-in"
                />
              )}
            </div>
          )}
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
                  <span>Demo</span>
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
              <div className="flex items-center space-x-1">
                {!isConfirming && (
                  <button
                    onClick={() => onEdit(project)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-200 rounded-xs hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-all cursor-pointer"
                    title="Edit Project Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                
                {isConfirming ? (
                  <div className="flex items-center space-x-1.5 bg-neutral-50 dark:bg-neutral-950 p-1 border border-red-200 dark:border-red-900/50 rounded-xs">
                    <button
                      onClick={() => {
                        onDelete(project.id);
                        setIsConfirming(false);
                      }}
                      className="px-2 py-1 text-[9px] font-mono font-black bg-red-600 hover:bg-red-700 text-white rounded-xs transition-colors cursor-pointer"
                      title="Permanently Delete"
                    >
                      DISCARD?
                    </button>
                    <button
                      onClick={() => setIsConfirming(false)}
                      className="px-1.5 py-1 text-[9px] font-mono text-neutral-450 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-xs transition-colors cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 rounded-xs hover:bg-neutral-100 dark:hover:bg-neutral-900/50 transition-all cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
