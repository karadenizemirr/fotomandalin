"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera, LucideIcon } from "lucide-react";

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// CTA Button Interface
interface CTAButton {
  text: string;
  href: string;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
  external?: boolean;
}

// Main CTA Interface
interface CTAProps {
  title?: string;
  description?: string;
  buttons?: CTAButton[];
  className?: string;
  variant?: "default" | "dark" | "light" | "gradient";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function CTA({
  title = "Özel Anlarınızı Ölümsüzleştirin",
  description = "Profesyonel fotoğrafçılık hizmetimiz ile hayatınızın en değerli anlarını kalıcı hale getirin",
  buttons = [
    {
      text: "Hemen Rezervasyon Yap",
      href: "/booking",
      variant: "primary",
      icon: ArrowRight,
    },
    {
      text: "Portfolyomuzu İncele",
      href: "/portfolio",
      variant: "secondary",
      icon: Camera,
    },
  ],
  className = "",
  variant = "default",
  size = "md",
  animated = true,
}: CTAProps) {
  // Variant styles
  const variantStyles = {
    default: "bg-gradient-to-r from-gray-900 to-black text-white",
    dark: "bg-black text-white",
    light: "bg-gray-50 text-gray-900",
    gradient: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
  };

  // Size styles
  const sizeStyles = {
    sm: {
      padding: "py-12",
      title: "text-2xl md:text-3xl",
      description: "text-lg",
      buttonPadding: "px-6 py-3",
    },
    md: {
      padding: "py-20",
      title: "text-4xl md:text-5xl",
      description: "text-xl",
      buttonPadding: "px-8 py-4",
    },
    lg: {
      padding: "py-28",
      title: "text-5xl md:text-6xl",
      description: "text-2xl",
      buttonPadding: "px-10 py-5",
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  // Button styles
  const getButtonStyles = (
    buttonVariant: "primary" | "secondary" = "primary"
  ) => {
    const baseStyles = `inline-flex items-center ${currentSize.buttonPadding} font-semibold rounded-xl transition-all duration-300 group`;

    if (variant === "light") {
      return buttonVariant === "primary"
        ? `${baseStyles} bg-black text-white hover:bg-gray-800`
        : `${baseStyles} border border-black text-black hover:bg-black hover:text-white`;
    }

    return buttonVariant === "primary"
      ? `${baseStyles} bg-white text-black hover:bg-gray-100`
      : `${baseStyles} border border-white text-white hover:bg-white hover:text-black`;
  };

  const content = (
    <div className="text-center">
      <h2 className={`${currentSize.title} font-bold mb-6`}>{title}</h2>
      <p
        className={`${currentSize.description} ${
          variant === "light" ? "text-gray-600" : "text-gray-300"
        } mb-10 max-w-2xl mx-auto`}
      >
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {buttons.map((button, index) => {
          const Icon = button.icon;

          const buttonContent = (
            <>
              {button.text}
              {Icon && (
                <Icon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              )}
            </>
          );

          if (button.external) {
            return (
              <a
                key={index}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className={getButtonStyles(button.variant)}
              >
                {buttonContent}
              </a>
            );
          }

          return (
            <Link
              key={index}
              href={button.href}
              className={getButtonStyles(button.variant)}
            >
              {buttonContent}
            </Link>
          );
        })}
      </div>
    </div>
  );

  if (animated) {
    return (
      <section
        className={`${currentSize.padding} ${currentVariant} ${className}`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className={`${currentSize.title} font-bold mb-6 text-center`}
            >
              {title}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className={`${currentSize.description} ${
                variant === "light" ? "text-gray-600" : "text-gray-300"
              } mb-10 max-w-2xl mx-auto text-center`}
            >
              {description}
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {buttons.map((button, index) => {
                const Icon = button.icon;

                const buttonContent = (
                  <>
                    {button.text}
                    {Icon && (
                      <Icon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </>
                );

                if (button.external) {
                  return (
                    <a
                      key={index}
                      href={button.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={getButtonStyles(button.variant)}
                    >
                      {buttonContent}
                    </a>
                  );
                }

                return (
                  <Link
                    key={index}
                    href={button.href}
                    className={getButtonStyles(button.variant)}
                  >
                    {buttonContent}
                  </Link>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${currentSize.padding} ${currentVariant} ${className}`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">{content}</div>
    </section>
  );
}

// Specialized CTAs for common use cases
export const BookingCTA = (props: Partial<CTAProps>) => (
  <CTA
    title="Hemen Rezervasyon Yapın"
    description="Profesyonel fotoğraf çekimi için bugün randevu alın"
    buttons={[
      {
        text: "Rezervasyon Yap",
        href: "/booking",
        variant: "primary",
        icon: ArrowRight,
      },
    ]}
    variant="gradient"
    {...props}
  />
);

export const ContactCTA = (props: Partial<CTAProps>) => (
  <CTA
    title="Bizimle İletişime Geçin"
    description="Sorularınız için bize ulaşın, size yardımcı olmaktan mutluluk duyarız"
    buttons={[
      {
        text: "İletişim",
        href: "/contact",
        variant: "primary",
        icon: ArrowRight,
      },
    ]}
    variant="dark"
    {...props}
  />
);

export const PortfolioCTA = (props: Partial<CTAProps>) => (
  <CTA
    title="Çalışmalarımızı İnceleyin"
    description="Geçmiş projelerimizi görün ve sizin için neler yapabileceğimizi keşfedin"
    buttons={[
      {
        text: "Portfolio",
        href: "/portfolio",
        variant: "primary",
        icon: Camera,
      },
    ]}
    variant="light"
    {...props}
  />
);

export const ServicesCTA = (props: Partial<CTAProps>) => (
  <CTA
    title="Hizmetlerimizi Keşfedin"
    description="Size en uygun fotoğraf çekimi paketini bulun"
    buttons={[
      {
        text: "Hizmetler",
        href: "/services",
        variant: "primary",
        icon: ArrowRight,
      },
      {
        text: "Fiyat Teklifi Al",
        href: "/contact",
        variant: "secondary",
      },
    ]}
    {...props}
  />
);
