"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Leaf, ShoppingCart, Truck, Sparkles, TrendingUp, Users, Package, Heart, Shield } from "lucide-react";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(() => import("framer-motion").then(mod => mod.motion.div), {
  ssr: false,
});

const roles = [
  {
    id: "farmer",
    title: "Farmer",
    description: "Connect directly with consumers and get fair prices for your produce",
    icon: Leaf,
    color: "var(--color-farm-green)",
    hoverColor: "var(--color-farm-green-dark)",
    route: "/auth/login"
  },
  {
    id: "consumer",
    title: "Consumer",
    description: "Buy fresh produce directly from farmers at transparent prices",
    icon: ShoppingCart,
    color: "var(--color-farm-sky)",
    hoverColor: "var(--color-farm-sky-dark)",
    route: "/auth/login"
  },
  {
    id: "intermediary",
    title: "Intermediary",
    description: "Facilitate fair trade and logistics between farmers and consumers",
    icon: Truck,
    color: "var(--color-farm-gold)",
    hoverColor: "var(--color-farm-gold-dark)",
    route: "/auth/login"
  },
];

const stats = [
  {
    title: "Active Farmers",
    value: "10,000+",
    icon: Users,
    color: "var(--color-farm-green)",
  },
  {
    title: "Price Increase",
    value: "30%",
    icon: TrendingUp,
    color: "var(--color-farm-gold)",
  },
  {
    title: "Happy Customers",
    value: "50,000+",
    icon: Sparkles,
    color: "var(--color-farm-sky)",
  },
];

const floatingElements = [
  {
    icon: Package,
    color: "var(--color-farm-green)",
    size: "w-8 h-8",
    position: "top-1/4 left-1/4",
    animation: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  },
  {
    icon: Heart,
    color: "var(--color-farm-gold)",
    size: "w-6 h-6",
    position: "top-1/3 right-1/4",
    animation: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  },
  {
    icon: Shield,
    color: "var(--color-farm-sky)",
    size: "w-7 h-7",
    position: "bottom-1/4 left-1/3",
    animation: {
      y: [0, -25, 0],
      transition: {
        duration: 5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  },
  {
    icon: Leaf,
    color: "var(--color-farm-green)",
    size: "w-6 h-6",
    position: "bottom-1/3 right-1/3",
    animation: {
      y: [0, -18, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  }
];

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const controls = useAnimation();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    setMounted(true);
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    });
  }, [controls]);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setTimeout(() => {
      router.push('/auth/login');
    }, 500);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[var(--color-farm-green-light)]">
      {/* Hero Section */}
      <MotionDiv 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Background Elements */}
        <MotionDiv
          className="absolute inset-0 bg-gradient-to-br from-[var(--color-farm-green-light)] via-white to-[var(--color-farm-sky-light)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{
            duration: 2,
            ease: "easeOut"
          }}
        />
        
        {/* Floating Elements */}
        {floatingElements.map((element, index) => (
          <MotionDiv
            key={index}
            className={`absolute ${element.position} ${element.size}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 0.5,
              scale: 1,
              y: element.animation.y
            }}
            transition={{
              opacity: { duration: 1, delay: index * 0.2 },
              scale: { duration: 0.5, delay: index * 0.2 },
              y: element.animation.transition
            }}
            style={{ color: element.color }}
          >
            <element.icon className="w-full h-full" />
          </MotionDiv>
        ))}

        {/* Main Content */}
        <MotionDiv
          initial={{ opacity: 1, y: 0 }}
          animate={controls}
          style={{ opacity, scale }}
          className="relative text-center px-4 z-10"
        >
          <MotionDiv 
            className="text-6xl font-bold mb-6 text-[var(--color-farm-green-dark)]"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.5
            }}
          >
            Welcome to Fair-Chain
          </MotionDiv>
          <MotionDiv 
            className="text-2xl mb-8 max-w-2xl mx-auto text-gray-600"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.8
            }}
          >
            A transparent and fair marketplace connecting farmers directly with consumers
          </MotionDiv>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Fair Prices", "Direct Trade", "Secure Payments"].map((feature, index) => (
              <MotionDiv
                key={feature}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 1.1 + index * 0.15
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm cursor-default"
              >
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </MotionDiv>
            ))}
          </div>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 1.4
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-[var(--color-farm-green)] hover:bg-[var(--color-farm-green-dark)] shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" })}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </MotionDiv>
        </MotionDiv>
      </MotionDiv>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <MotionDiv
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center mb-4">
                  <stat.icon className="w-12 h-12" style={{ color: stat.color }} />
                </div>
                <h3 className="text-3xl font-bold text-center mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-center">{stat.title}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div id="roles" className="py-16">
        <div className="container mx-auto px-4">
          <MotionDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-[var(--color-farm-green-dark)] mb-4">
              Choose Your Role
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our platform and be part of the agricultural revolution
            </p>
          </MotionDiv>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role) => (
              <MotionDiv
                key={role.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  className={`h-full transition-all duration-300 ${
                    selectedRole === role.id
                      ? "ring-2 ring-offset-2 shadow-2xl"
                      : "shadow-lg hover:shadow-xl"
                  }`}
                  style={{
                    borderColor: role.color,
                    boxShadow: `0 10px 15px -3px ${role.color}20, 0 4px 6px -2px ${role.color}10`,
                  }}
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      <MotionDiv
                        className="p-6 rounded-full mb-6"
                        style={{ backgroundColor: `${role.color}20` }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 1 }}
                      >
                        <role.icon
                          className="w-10 h-10"
                          style={{ color: role.color }}
                        />
                      </MotionDiv>
                      <h3 className="text-2xl font-semibold mb-4">{role.title}</h3>
                      <p className="text-gray-600 mb-6">{role.description}</p>
                      <MotionDiv
                        whileHover={{ 
                          scale: 1.05,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          className="mt-auto transition-all duration-300"
                          style={{
                            borderColor: role.color,
                            color: role.color,
                            boxShadow: `0 4px 6px -1px ${role.color}20, 0 2px 4px -1px ${role.color}10`,
                            backgroundColor: `${role.color}10`,
                          }}
                          onClick={() => handleRoleSelect(role.id)}
                        >
                          Select Role
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </MotionDiv>
                    </div>
                  </CardContent>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
