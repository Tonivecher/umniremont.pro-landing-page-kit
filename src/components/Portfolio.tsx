import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

type ProjectImage = {
  src: string;
  alt: string;
  caption: string;
};

type Project = {
  id: string;
  title: string;
  category: string;
  stage: string;
  description: string;
  highlights: string[];
  gallery: ProjectImage[];
};

const projects: Project[] = [
  {
    id: 'modern-interior',
    title: 'Современный интерьер',
    category: 'Квартира',
    stage: 'Реализация',
    description:
      'Лаконичные формы, продуманная геометрия пространства и чистые цвета. Современный подход к проектированию комфортной среды.',
    highlights: ['панорамные окна', 'натуральное дерево', 'светлые тона'],
    gallery: [
      {
        src: '/portfolio/objects/modern-interior/media__1779356868461.jpg',
        alt: 'Современный интерьер — гостиная',
        caption: 'Зона гостиной с видом',
      },
      {
        src: '/portfolio/objects/modern-interior/media__1779356868460.jpg',
        alt: 'Современный интерьер — кухня',
        caption: 'Кухня и столовая',
      },
      {
        src: '/portfolio/objects/modern-interior/media__1779356868465.jpg',
        alt: 'Современный интерьер — ванная комната',
        caption: 'Ванная с мраморной текстурой',
      },
    ],
  },
  {
    id: 'tower-residence',
    title: 'Башенная резиденция',
    category: 'Резиденция',
    stage: 'Реализация',
    description:
      'Панорамные спальни, глубокий камень в санузле и теплый рисунок пола собраны в цельный интерьер без визуального шума.',
    highlights: ['панорамное остекление', 'темный камень', 'скрытый свет'],
    gallery: [
      {
        src: '/portfolio/objects/tower-residence/01-bedroom-view.jpg',
        alt: 'Башенная резиденция — спальня с панорамным окном',
        caption: 'Спальня с панорамным остеклением',
      },
      {
        src: '/portfolio/objects/tower-residence/02-bathroom-onyx.jpg',
        alt: 'Башенная резиденция — санузел с темным камнем',
        caption: 'Санузел с темным камнем',
      },
      {
        src: '/portfolio/objects/tower-residence/06-kitchen.jpg',
        alt: 'Башенная резиденция — линейная кухня',
        caption: 'Линейная кухня',
      },
      {
        src: '/portfolio/objects/tower-residence/03-hall.jpg',
        alt: 'Башенная резиденция — проходная зона и гостиная',
        caption: 'Проходная зона',
      },
    ],
  },
  {
    id: 'compact-light-apartment',
    title: 'Светлая компактная квартира',
    category: 'Квартира',
    stage: 'Реализация',
    description:
      'Светлый дуб, черные акценты и зеркальные поверхности работают на ощущение воздуха даже в компактном формате.',
    highlights: ['светлый дуб', 'черные детали', 'интегрированное хранение'],
    gallery: [
      {
        src: '/portfolio/objects/compact-light-apartment/01-bedroom.jpg',
        alt: 'Светлая компактная квартира — спальня',
        caption: 'Главная спальня',
      },
      {
        src: '/portfolio/objects/compact-light-apartment/02-kitchenette.jpg',
        alt: 'Светлая компактная квартира — кухня и проход',
        caption: 'Кухня и проход',
      },
      {
        src: '/portfolio/objects/compact-light-apartment/03-dining.jpg',
        alt: 'Светлая компактная квартира — обеденная зона',
        caption: 'Небольшая обеденная зона',
      },
    ],
  },
  {
    id: 'glass-block-apartment',
    title: 'Апартамент со стеклоблоками',
    category: 'Апартамент',
    stage: 'Реализация',
    description:
      'Функциональный блок построен на чистой геометрии: белая плитка, стеклоблоки и спокойный свет делают пространство легким.',
    highlights: ['стеклоблоки', 'белая плитка', 'функциональная ванная'],
    gallery: [
      {
        src: '/portfolio/objects/glass-block-apartment/01-corridor.jpg',
        alt: 'Апартамент со стеклоблоками — коридор',
        caption: 'Коридор со стеклоблоками',
      },
      {
        src: '/portfolio/objects/glass-block-apartment/03-bath-angle.jpg',
        alt: 'Апартамент со стеклоблоками — ванная зона',
        caption: 'Ванная зона',
      },
      {
        src: '/portfolio/objects/glass-block-apartment/02-bath-mirror.jpg',
        alt: 'Апартамент со стеклоблоками — санузел с зеркалом',
        caption: 'Санузел и зеркало',
      },
    ],
  },
  {
    id: 'graphite-apartment',
    title: 'Графитовый апартамент',
    category: 'Апартамент',
    stage: 'Реализация',
    description:
      'Графитовая кухня, древесные плоскости и латунные акценты собирают интерьер с более плотным, камерным характером.',
    highlights: ['графитовая кухня', 'латунные акценты', 'акцентная спальня'],
    gallery: [
      {
        src: '/portfolio/objects/graphite-apartment/01-kitchen.jpg',
        alt: 'Графитовый апартамент — кухня',
        caption: 'Графитовая кухня',
      },
      {
        src: '/portfolio/objects/graphite-apartment/03-bedroom-wallpaper.jpg',
        alt: 'Графитовый апартамент — спальня с акцентной стеной',
        caption: 'Спальня с акцентной стеной',
      },
      {
        src: '/portfolio/objects/graphite-apartment/05-bathroom-vanity.jpg',
        alt: 'Графитовый апартамент — ванная с латунью',
        caption: 'Ванная с латунными деталями',
      },
    ],
  },
];

export const Portfolio: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('modern-interior');
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSelectImage = (projectId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndices((prev) => ({ ...prev, [projectId]: index }));
  };

  return (
    <section id="portfolio" className="relative bg-brand-dark px-5 py-24 sm:px-8 md:px-12 xl:px-20 md:py-36">
      {/* Заголовок секции */}
      <div className="mx-auto max-w-7xl mb-12 md:mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <span className="mb-4 inline-block rounded-full bg-white/[0.05] border border-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Реализованные объекты
          </span>
          <h2 data-split-heading className="text-4xl md:text-6xl font-display text-white tracking-tight leading-tight">
            Портфолио
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/60 leading-relaxed max-w-xl">
            Компактный обзор объектов. Нажмите на карточку, чтобы посмотреть фотографии всех зон и планировочные решения.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-white/50 md:block">
            {`01 — ${String(projects.length).padStart(2, '0')} ОБЪЕКТОВ`}
          </div>

          <MagneticButton>
            <a
              href="#contact"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/20 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:border-white/50 hover:bg-white/[0.06] sm:px-9"
              aria-label="Перейти к контактам для обсуждения проекта"
            >
              <span className="relative z-10 transition-colors duration-500 group-hover:text-brand-dark">
                Обсудить проект
              </span>
              <div className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
            </a>
          </MagneticButton>
        </div>
      </div>

      {/* Компактная мягкая сетка карточек в стиле сайта */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 items-start">
        {projects.map((project) => {
          const isExpanded = expandedId === project.id;
          const activeIndex = activeImageIndices[project.id] ?? 0;
          const currentImg = project.gallery[activeIndex] || project.gallery[0];

          return (
            <article
              key={project.id}
              className={`group relative flex flex-col overflow-hidden rounded-[28px] border bg-[#141416]/90 backdrop-blur-sm transition-all duration-300 ${
                isExpanded
                  ? 'border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.65)]'
                  : 'border-white/10 hover:border-white/20 hover:bg-[#18181b]/90'
              }`}
            >
              {/* Верхняя компактная медиа-зона с мягким радиусом 4:3 */}
              <div
                className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-t-[26px] bg-[#0d0d0f]"
                onClick={() => toggleExpand(project.id)}
              >
                <img
                  src={currentImg.src}
                  alt={currentImg.alt}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                  loading="lazy"
                />

                {/* Верхние мягкие капсульные бейджи */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/65 via-black/25 to-transparent">
                  <span className="rounded-full bg-black/60 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/90 backdrop-blur-md border border-white/10">
                    {project.category}
                  </span>
                  <span className="rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] text-white/80 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3 text-white/70" />
                    <span>{project.gallery.length} фото</span>
                  </span>
                </div>

                {/* Подпись к текущему ракурсу */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/35 to-transparent">
                  <span className="inline-block rounded-full bg-black/50 px-3 py-1 text-xs text-white/90 backdrop-blur-sm border border-white/10">
                    {currentImg.caption}
                  </span>
                </div>
              </div>

              {/* Тело карточки */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3
                    className="font-display text-2xl text-white cursor-pointer transition-colors hover:text-white/85"
                    onClick={() => toggleExpand(project.id)}
                  >
                    {project.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/55 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Кнопка раскрытия — мягкая капсула в тон кнопки хедера */}
                <button
                  type="button"
                  onClick={() => toggleExpand(project.id)}
                  className={`mt-5 flex w-full items-center justify-between rounded-full border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                    isExpanded
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-white/35 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span>{isExpanded ? 'Свернуть галерею' : `Смотреть проект (${project.gallery.length} зоны)`}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-white/70 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Раскрывающийся по клику блок (In-Place Expand) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-white/10 bg-black/30 px-6 pb-6 pt-5"
                  >
                    {/* Переключатель зон/комнат */}
                    <div className="mb-4">
                      <div className="mb-2.5 flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Выберите зону:
                        </span>
                        <span className="font-mono text-[10px] text-white/40">
                          {activeIndex + 1} из {project.gallery.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {project.gallery.map((img, idx) => (
                          <button
                            key={img.src}
                            type="button"
                            onClick={(e) => handleSelectImage(project.id, idx, e)}
                            className={`group/thumb relative aspect-[4/3] overflow-hidden rounded-2xl border transition-all ${
                              activeIndex === idx
                                ? 'border-white/60 ring-2 ring-white/20 scale-[1.02]'
                                : 'border-white/10 opacity-55 hover:opacity-100 hover:border-white/30'
                            }`}
                            title={img.caption}
                          >
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-black/85 px-1 py-0.5 text-center font-mono text-[8px] text-white truncate">
                              {img.caption.replace(/^(Зона\s|Главная\s|Небольшая\s)/i, '')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Теги материалов — круглые капсулы */}
                    <div className="mb-5 flex flex-wrap gap-2">
                      {project.highlights.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/[0.05] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.14em] text-white/60 border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Целевое действие — мягкая капсула */}
                    <a
                      href="#contact"
                      className="group/cta flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/20 px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-all hover:bg-white hover:text-brand-dark"
                    >
                      <span>Обсудить похожий ремонт</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </section>
  );
};
