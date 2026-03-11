import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Типы пользователей
const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  MANAGER: 'manager',
};

// Начальные данные
let usersDB = [
  {
    id: 1,
    email: 'admin@lms.com',
    password: 'admin123',
    fullName: 'System Administrator',
    phone: '+1234567890',
    role: ROLES.ADMIN,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 2,
    email: 'teacher@lms.com',
    password: 'teacher123',
    fullName: 'John Teacher',
    phone: '+1234567891',
    role: ROLES.TEACHER,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 3,
    email: 'student@lms.com',
    password: 'student123',
    fullName: 'Jane Student',
    phone: '+1234567892',
    role: ROLES.STUDENT,
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

let coursesDB = [
  {
    id: 1,
    title: 'Introduction to React Native',
    description: 'Learn the basics of React Native development',
    category: 'Mobile Development',
    teacherId: 2,
    teacherName: 'John Teacher',
    createdAt: new Date().toISOString(),
    status: 'active',
    enrolledStudents: [3],
    sections: [
      {
        id: 1,
        title: 'Getting Started',
        lessons: [
          {
            id: 1,
            title: 'What is React Native?',
            type: 'video',
            content: 'https://example.com/video1',
            duration: '10:30',
          },
          {
            id: 2,
            title: 'Setting Up Environment',
            type: 'text',
            content: 'Install Node.js, npm, and Expo...',
          },
        ],
      },
      {
        id: 2,
        title: 'Components',
        lessons: [
          {
            id: 3,
            title: 'Core Components',
            type: 'text',
            content: 'View, Text, ScrollView, etc...',
          },
        ],
      },
    ],
  },
];

let categoriesDB = ['Mobile Development', 'Web Development', 'Design', 'Business'];

let nextUserId = 4;
let nextCourseId = 2;
let nextSectionId = 3;
let nextLessonId = 4;

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // UI state
  const [currentScreen, setCurrentScreen] = useState('login');
  const [users, setUsers] = useState(usersDB);
  const [courses, setCourses] = useState(coursesDB);
  const [categories, setCategories] = useState(categoriesDB);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: ROLES.STUDENT,
  });
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  const [courseForm, setCourseForm] = useState({
    id: null,
    title: '',
    description: '',
    category: '',
    teacherId: null,
    teacherName: '',
    sections: [],
  });
  
  const [sectionForm, setSectionForm] = useState({
    id: null,
    title: '',
    lessons: [],
  });
  
  const [lessonForm, setLessonForm] = useState({
    id: null,
    title: '',
    type: 'text',
    content: '',
    duration: '',
  });
  
  const [userForm, setUserForm] = useState({
    id: null,
    email: '',
    fullName: '',
    phone: '',
    role: ROLES.STUDENT,
    isActive: true,
  });
  
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Login handler
  const handleLogin = () => {
    const user = users.find(
      u => u.email === loginForm.email && u.password === loginForm.password && u.isActive
    );
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setCurrentScreen(user.role === ROLES.ADMIN ? 'admin' : 'courses');
      setLoginForm({ email: '', password: '' });
    } else {
      Alert.alert('Error', 'Invalid credentials or inactive account');
    }
  };

  // Register handler
  const handleRegister = () => {
    if (!registerForm.email || !registerForm.password || !registerForm.fullName) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (users.find(u => u.email === registerForm.email)) {
      Alert.alert('Error', 'Email already exists');
      return;
    }
    
    const newUser = {
      ...registerForm,
      id: nextUserId++,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    usersDB.push(newUser);
    setUsers([...usersDB]);
    setShowRegisterModal(false);
    setRegisterForm({ email: '', password: '', fullName: '', phone: '', role: ROLES.STUDENT });
    Alert.alert('Success', 'Registration successful! Please login.');
  };

  // Password recovery
  const handleRecovery = () => {
    const user = users.find(u => u.email === recoveryEmail);
    if (user) {
      Alert.alert('Success', `Recovery email sent to ${recoveryEmail}`);
      setShowRecoveryModal(false);
      setRecoveryEmail('');
    } else {
      Alert.alert('Error', 'Email not found');
    }
  };

  // Course CRUD
  const saveCourse = () => {
    if (!courseForm.title || !courseForm.category) {
      Alert.alert('Error', 'Title and category are required');
      return;
    }

    if (courseForm.id) {
      // Update course
      const index = coursesDB.findIndex(c => c.id === courseForm.id);
      if (index !== -1) {
        coursesDB[index] = {
          ...coursesDB[index],
          ...courseForm,
          teacherId: currentUser.id,
          teacherName: currentUser.fullName,
        };
        Alert.alert('Success', 'Course updated');
      }
    } else {
      // Create course
      const newCourse = {
        ...courseForm,
        id: nextCourseId++,
        teacherId: currentUser.id,
        teacherName: currentUser.fullName,
        createdAt: new Date().toISOString(),
        status: 'active',
        enrolledStudents: [],
        sections: [],
      };
      coursesDB.push(newCourse);
      Alert.alert('Success', 'Course created');
    }

    setShowCourseModal(false);
    resetCourseForm();
    setCourses([...coursesDB]);
  };

  const deleteCourse = (courseId) => {
    Alert.alert(
      'Delete Course',
      'Are you sure? This will delete all course content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            coursesDB = coursesDB.filter(c => c.id !== courseId);
            setCourses([...coursesDB]);
            if (selectedCourse?.id === courseId) {
              setSelectedCourse(null);
              setCurrentScreen('courses');
            }
          }
        }
      ]
    );
  };

  // Section CRUD
  const saveSection = () => {
    if (!sectionForm.title) {
      Alert.alert('Error', 'Section title is required');
      return;
    }

    const courseIndex = coursesDB.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex === -1) return;

    if (sectionForm.id) {
      // Update section
      const sectionIndex = coursesDB[courseIndex].sections.findIndex(s => s.id === sectionForm.id);
      if (sectionIndex !== -1) {
        coursesDB[courseIndex].sections[sectionIndex] = {
          ...sectionForm,
          lessons: coursesDB[courseIndex].sections[sectionIndex].lessons,
        };
        Alert.alert('Success', 'Section updated');
      }
    } else {
      // Create section
      const newSection = {
        ...sectionForm,
        id: nextSectionId++,
        lessons: [],
      };
      coursesDB[courseIndex].sections.push(newSection);
      Alert.alert('Success', 'Section created');
    }

    setShowSectionModal(false);
    resetSectionForm();
    setCourses([...coursesDB]);
    setSelectedCourse({ ...coursesDB[courseIndex] });
  };

  const deleteSection = (sectionId) => {
    Alert.alert(
      'Delete Section',
      'Are you sure? This will delete all lessons in this section.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const courseIndex = coursesDB.findIndex(c => c.id === selectedCourse.id);
            if (courseIndex !== -1) {
              coursesDB[courseIndex].sections = coursesDB[courseIndex].sections.filter(
                s => s.id !== sectionId
              );
              setCourses([...coursesDB]);
              setSelectedCourse({ ...coursesDB[courseIndex] });
            }
          }
        }
      ]
    );
  };

  // Lesson CRUD
  const saveLesson = () => {
    if (!lessonForm.title) {
      Alert.alert('Error', 'Lesson title is required');
      return;
    }

    const courseIndex = coursesDB.findIndex(c => c.id === selectedCourse.id);
    if (courseIndex === -1) return;

    const sectionIndex = coursesDB[courseIndex].sections.findIndex(
      s => s.id === selectedSection.id
    );
    if (sectionIndex === -1) return;

    if (lessonForm.id) {
      // Update lesson
      const lessonIndex = coursesDB[courseIndex].sections[sectionIndex].lessons.findIndex(
        l => l.id === lessonForm.id
      );
      if (lessonIndex !== -1) {
        coursesDB[courseIndex].sections[sectionIndex].lessons[lessonIndex] = lessonForm;
        Alert.alert('Success', 'Lesson updated');
      }
    } else {
      // Create lesson
      const newLesson = {
        ...lessonForm,
        id: nextLessonId++,
      };
      coursesDB[courseIndex].sections[sectionIndex].lessons.push(newLesson);
      Alert.alert('Success', 'Lesson created');
    }

    setShowLessonModal(false);
    resetLessonForm();
    setCourses([...coursesDB]);
    setSelectedCourse({ ...coursesDB[courseIndex] });
  };

  const deleteLesson = (lessonId) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const courseIndex = coursesDB.findIndex(c => c.id === selectedCourse.id);
            if (courseIndex === -1) return;

            const sectionIndex = coursesDB[courseIndex].sections.findIndex(
              s => s.id === selectedSection.id
            );
            if (sectionIndex === -1) return;

            coursesDB[courseIndex].sections[sectionIndex].lessons = 
              coursesDB[courseIndex].sections[sectionIndex].lessons.filter(
                l => l.id !== lessonId
              );
            
            setCourses([...coursesDB]);
            setSelectedCourse({ ...coursesDB[courseIndex] });
          }
        }
      ]
    );
  };

  // User management (Admin only)
  const saveUser = () => {
    if (!userForm.email || !userForm.fullName) {
      Alert.alert('Error', 'Email and name are required');
      return;
    }

    if (userForm.id) {
      // Update user
      const index = usersDB.findIndex(u => u.id === userForm.id);
      if (index !== -1) {
        usersDB[index] = { ...usersDB[index], ...userForm };
        Alert.alert('Success', 'User updated');
      }
    } else {
      // Create user
      if (usersDB.find(u => u.email === userForm.email)) {
        Alert.alert('Error', 'Email already exists');
        return;
      }
      
      const newUser = {
        ...userForm,
        id: nextUserId++,
        password: 'default123',
        createdAt: new Date().toISOString(),
      };
      usersDB.push(newUser);
      Alert.alert('Success', 'User created');
    }

    setShowUserModal(false);
    resetUserForm();
    setUsers([...usersDB]);
  };

  const toggleUserStatus = (userId) => {
    const index = usersDB.findIndex(u => u.id === userId);
    if (index !== -1) {
      usersDB[index].isActive = !usersDB[index].isActive;
      setUsers([...usersDB]);
    }
  };

  // Category management
  const saveCategory = () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      // Update category
      const index = categoriesDB.findIndex(c => c === editingCategory);
      if (index !== -1) {
        categoriesDB[index] = categoryName;
      }
    } else {
      // Create category
      categoriesDB.push(categoryName);
    }

    setShowCategoryModal(false);
    setCategoryName('');
    setEditingCategory(null);
    setCategories([...categoriesDB]);
  };

  const deleteCategory = (category) => {
    Alert.alert(
      'Delete Category',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            categoriesDB = categoriesDB.filter(c => c !== category);
            setCategories([...categoriesDB]);
          }
        }
      ]
    );
  };

  // Enroll in course
  const enrollInCourse = (courseId) => {
    const courseIndex = coursesDB.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      if (!coursesDB[courseIndex].enrolledStudents.includes(currentUser.id)) {
        coursesDB[courseIndex].enrolledStudents.push(currentUser.id);
        setCourses([...coursesDB]);
        Alert.alert('Success', 'Enrolled in course');
      } else {
        Alert.alert('Info', 'Already enrolled');
      }
    }
  };

  // Reset forms
  const resetCourseForm = () => {
    setCourseForm({
      id: null,
      title: '',
      description: '',
      category: '',
      teacherId: null,
      teacherName: '',
      sections: [],
    });
  };

  const resetSectionForm = () => {
    setSectionForm({
      id: null,
      title: '',
      lessons: [],
    });
  };

  const resetLessonForm = () => {
    setLessonForm({
      id: null,
      title: '',
      type: 'text',
      content: '',
      duration: '',
    });
  };

  const resetUserForm = () => {
    setUserForm({
      id: null,
      email: '',
      fullName: '',
      phone: '',
      role: ROLES.STUDENT,
      isActive: true,
    });
  };

  // Filter courses
  const getFilteredCourses = () => {
    let filtered = [...courses];
    
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }
    
    // Filter by role
    if (currentUser?.role === ROLES.TEACHER) {
      filtered = filtered.filter(c => c.teacherId === currentUser.id);
    } else if (currentUser?.role === ROLES.STUDENT) {
      filtered = filtered.filter(c => c.enrolledStudents?.includes(currentUser.id));
    }
    
    return filtered;
  };

  // Get statistics
  const getStatistics = () => {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalCourses: courses.length,
      totalStudents: users.filter(u => u.role === ROLES.STUDENT).length,
      totalTeachers: users.filter(u => u.role === ROLES.TEACHER).length,
      totalCategories: categories.length,
      completedCourses: courses.filter(c => 
        c.enrolledStudents?.includes(currentUser?.id)
      ).length,
    };
  };

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
        
        <View style={styles.authHeader}>
          <Text style={styles.authTitle}>📚 LMS Platform</Text>
          <Text style={styles.authSubtitle}>Learning Management System</Text>
        </View>

        <View style={styles.authContainer}>
          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>Welcome Back!</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={loginForm.email}
                onChangeText={text => setLoginForm({ ...loginForm, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={loginForm.password}
                onChangeText={text => setLoginForm({ ...loginForm, password: text })}
                placeholder="Enter your password"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.authLinks}>
              <TouchableOpacity onPress={() => setShowRecoveryModal(true)}>
                <Text style={styles.authLink}>Forgot Password?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowRegisterModal(true)}>
                <Text style={styles.authLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialAuth}>
              <Text style={styles.socialAuthText}>Or login with</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Text>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Text>GitHub</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Registration Modal */}
        <Modal visible={showRegisterModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Create Account</Text>
              
              <ScrollView>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={registerForm.fullName}
                    onChangeText={text => setRegisterForm({ ...registerForm, fullName: text })}
                    placeholder="Enter your full name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={registerForm.email}
                    onChangeText={text => setRegisterForm({ ...registerForm, email: text })}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    value={registerForm.password}
                    onChangeText={text => setRegisterForm({ ...registerForm, password: text })}
                    placeholder="Enter your password"
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={registerForm.phone}
                    onChangeText={text => setRegisterForm({ ...registerForm, phone: text })}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.roleSelector}>
                    {Object.values(ROLES).map(role => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleOption,
                          registerForm.role === role && styles.roleOptionActive
                        ]}
                        onPress={() => setRegisterForm({ ...registerForm, role })}
                      >
                        <Text style={registerForm.role === role && styles.roleOptionTextActive}>
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowRegisterModal(false);
                    setRegisterForm({ email: '', password: '', fullName: '', phone: '', role: ROLES.STUDENT });
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleRegister}
                >
                  <Text style={styles.saveButtonText}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Password Recovery Modal */}
        <Modal visible={showRecoveryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Password Recovery</Text>
              
              <Text style={styles.recoveryText}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={recoveryEmail}
                  onChangeText={setRecoveryEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowRecoveryModal(false);
                    setRecoveryEmail('');
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleRecovery}
                >
                  <Text style={styles.saveButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Admin Dashboard
  if (currentScreen === 'admin') {
    const stats = getStatistics();
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👑 Admin Dashboard</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setCurrentUser(null);
                setIsLoggedIn(false);
                setCurrentScreen('login');
              }}
            >
              <Text style={styles.headerButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>Welcome, {currentUser.fullName}</Text>
          <Text style={styles.userRole}>Role: {currentUser.role}</Text>
        </View>

        <ScrollView style={styles.adminContent}>
          {/* Statistics Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.activeUsers}</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalCourses}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalStudents}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  resetUserForm();
                  setShowUserModal(true);
                }}
              >
                <Text style={styles.actionButtonText}>➕ Add User</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setCurrentScreen('courses');
                }}
              >
                <Text style={styles.actionButtonText}>📚 Manage Courses</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                  setShowCategoryModal(true);
                }}
              >
                <Text style={styles.actionButtonText}>🏷️ Add Category</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Users List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Management</Text>
            {users.map(user => (
              <View key={user.id} style={styles.userItem}>
                <View style={styles.userItemInfo}>
                  <Text style={styles.userItemName}>{user.fullName}</Text>
                  <Text style={styles.userItemEmail}>{user.email}</Text>
                  <View style={styles.userItemMeta}>
                    <Text style={styles.userItemRole}>{user.role}</Text>
                    <Text style={[styles.userItemStatus, user.isActive ? styles.statusActive : styles.statusInactive]}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>
                <View style={styles.userItemActions}>
                  <TouchableOpacity
                    style={styles.userItemAction}
                    onPress={() => {
                      setUserForm({
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        phone: user.phone || '',
                        role: user.role,
                        isActive: user.isActive,
                      });
                      setShowUserModal(true);
                    }}
                  >
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.userItemAction}
                    onPress={() => toggleUserStatus(user.id)}
                  >
                    <Text>{user.isActive ? '🔒' : '🔓'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Categories Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {categories.map(category => (
              <View key={category} style={styles.categoryItem}>
                <Text style={styles.categoryName}>{category}</Text>
                <View style={styles.categoryActions}>
                  <TouchableOpacity
                    style={styles.categoryAction}
                    onPress={() => {
                      setEditingCategory(category);
                      setCategoryName(category);
                      setShowCategoryModal(true);
                    }}
                  >
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.categoryAction}
                    onPress={() => deleteCategory(category)}
                  >
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* User Modal */}
        <Modal visible={showUserModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalView, { maxHeight: '80%' }]}>
              <Text style={styles.modalTitle}>
                {userForm.id ? 'Edit User' : 'New User'}
              </Text>
              
              <ScrollView>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={userForm.fullName}
                    onChangeText={text => setUserForm({ ...userForm, fullName: text })}
                    placeholder="Enter full name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={userForm.email}
                    onChangeText={text => setUserForm({ ...userForm, email: text })}
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={userForm.phone}
                    onChangeText={text => setUserForm({ ...userForm, phone: text })}
                    placeholder="Enter phone"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.roleSelector}>
                    {Object.values(ROLES).map(role => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleOption,
                          userForm.role === role && styles.roleOptionActive
                        ]}
                        onPress={() => setUserForm({ ...userForm, role })}
                      >
                        <Text style={userForm.role === role && styles.roleOptionTextActive}>
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setUserForm({ ...userForm, isActive: !userForm.isActive })}
                >
                  <View style={[styles.checkbox, userForm.isActive && styles.checkboxChecked]}>
                    {userForm.isActive && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Active Account</Text>
                </TouchableOpacity>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowUserModal(false);
                    resetUserForm();
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveUser}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Category Modal */}
        <Modal visible={showCategoryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category Name</Text>
                <TextInput
                  style={styles.input}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="Enter category name"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCategoryModal(false);
                    setCategoryName('');
                    setEditingCategory(null);
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveCategory}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Courses List Screen
  if (currentScreen === 'courses') {
    const filteredCourses = getFilteredCourses();
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 Courses</Text>
          <View style={styles.headerButtons}>
            {currentUser.role === ROLES.ADMIN && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setCurrentScreen('admin')}
              >
                <Text style={styles.headerButtonText}>Admin</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setCurrentUser(null);
                setIsLoggedIn(false);
                setCurrentScreen('login');
              }}
            >
              <Text style={styles.headerButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>Welcome, {currentUser.fullName}</Text>
          <Text style={styles.userRole}>Role: {currentUser.role}</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView horizontal style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text>All</Text>
            </TouchableOpacity>
            
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, selectedCategory === category && styles.filterChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {(currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.TEACHER) && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              resetCourseForm();
              setShowCourseModal(true);
            }}
          >
            <Text style={styles.createButtonText}>+ Create New Course</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={filteredCourses}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedCourse(item);
                setCurrentScreen('courseDetail');
              }}
            >
              <View style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseTitle}>{item.title}</Text>
                  {currentUser.role === ROLES.TEACHER && item.teacherId === currentUser.id && (
                    <View style={styles.courseActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setCourseForm({
                            id: item.id,
                            title: item.title,
                            description: item.description,
                            category: item.category,
                            teacherId: item.teacherId,
                            teacherName: item.teacherName,
                          });
                          setShowCourseModal(true);
                        }}
                      >
                        <Text style={styles.courseActionText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteCourse(item.id)}>
                        <Text style={styles.courseActionText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <Text style={styles.courseCategory}>{item.category}</Text>
                <Text style={styles.courseDescription} numberOfLines={2}>
                  {item.description || 'No description'}
                </Text>
                
                <View style={styles.courseFooter}>
                  <Text style={styles.courseTeacher}>👨‍🏫 {item.teacherName}</Text>
                  <Text style={styles.courseStudents}>👥 {item.enrolledStudents?.length || 0} students</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text>No courses found</Text>
            </View>
          }
        />

        {/* Course Modal */}
        <Modal visible={showCourseModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {courseForm.id ? 'Edit Course' : 'Create New Course'}
              </Text>
              
              <ScrollView>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={courseForm.title}
                    onChangeText={text => setCourseForm({ ...courseForm, title: text })}
                    placeholder="Enter course title"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={courseForm.description}
                    onChangeText={text => setCourseForm({ ...courseForm, description: text })}
                    placeholder="Enter course description"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Category *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryOption,
                          courseForm.category === category && styles.categoryOptionActive
                        ]}
                        onPress={() => setCourseForm({ ...courseForm, category })}
                      >
                        <Text style={courseForm.category === category && styles.categoryOptionTextActive}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCourseModal(false);
                    resetCourseForm();
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveCourse}
                >
                  <Text style={styles.saveButtonText}>
                    {courseForm.id ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Course Detail Screen
  if (currentScreen === 'courseDetail' && selectedCourse) {
    const isTeacher = currentUser.role === ROLES.TEACHER && selectedCourse.teacherId === currentUser.id;
    const isAdmin = currentUser.role === ROLES.ADMIN;
    const canEdit = isTeacher || isAdmin;
    const isEnrolled = selectedCourse.enrolledStudents?.includes(currentUser.id);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedCourse(null);
              setCurrentScreen('courses');
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Details</Text>
          <View style={styles.headerButtons}>
            {canEdit && (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    resetSectionForm();
                    setShowSectionModal(true);
                  }}
                >
                  <Text style={styles.headerButtonText}>+ Section</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView style={styles.courseDetailContent}>
          <View style={styles.courseDetailHeader}>
            <Text style={styles.courseDetailTitle}>{selectedCourse.title}</Text>
            <Text style={styles.courseDetailCategory}>{selectedCourse.category}</Text>
            <Text style={styles.courseDetailTeacher}>Instructor: {selectedCourse.teacherName}</Text>
            
            {!isEnrolled && currentUser.role === ROLES.STUDENT && (
              <TouchableOpacity
                style={styles.enrollButton}
                onPress={() => enrollInCourse(selectedCourse.id)}
              >
                <Text style={styles.enrollButtonText}>Enroll in Course</Text>
              </TouchableOpacity>
            )}
            
            {isEnrolled && (
              <View style={styles.enrolledBadge}>
                <Text style={styles.enrolledBadgeText}>✓ Enrolled</Text>
              </View>
            )}
          </View>

          {selectedCourse.description && (
            <View style={styles.courseDetailSection}>
              <Text style={styles.courseDetailSectionTitle}>Description</Text>
              <Text style={styles.courseDetailText}>{selectedCourse.description}</Text>
            </View>
          )}

          <View style={styles.courseDetailSection}>
            <Text style={styles.courseDetailSectionTitle}>Course Content</Text>
            
            {selectedCourse.sections?.map(section => (
              <View key={section.id} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {canEdit && (
                    <View style={styles.sectionActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedSection(section);
                          resetLessonForm();
                          setShowLessonModal(true);
                        }}
                      >
                        <Text style={styles.sectionAction}>+ Lesson</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setSectionForm({
                            id: section.id,
                            title: section.title,
                          });
                          setShowSectionModal(true);
                        }}
                      >
                        <Text style={styles.sectionAction}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteSection(section.id)}>
                        <Text style={styles.sectionAction}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {section.lessons?.map(lesson => (
                  <TouchableOpacity
                    key={lesson.id}
                    onPress={() => {
                      setSelectedLesson(lesson);
                      setCurrentScreen('lesson');
                    }}
                  >
                    <View style={styles.lessonItem}>
                      <View style={styles.lessonIcon}>
                        <Text>{lesson.type === 'video' ? '🎥' : '📝'}</Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        {lesson.duration && (
                          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                        )}
                      </View>
                      {canEdit && (
                        <View style={styles.lessonActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setLessonForm({
                                id: lesson.id,
                                title: lesson.title,
                                type: lesson.type,
                                content: lesson.content,
                                duration: lesson.duration || '',
                              });
                              setShowLessonModal(true);
                            }}
                          >
                            <Text style={styles.lessonAction}>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteLesson(lesson.id)}>
                            <Text style={styles.lessonAction}>🗑️</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}

                {(!section.lessons || section.lessons.length === 0) && (
                  <Text style={styles.emptyLessons}>No lessons yet</Text>
                )}
              </View>
            ))}

            {(!selectedCourse.sections || selectedCourse.sections.length === 0) && (
              <Text style={styles.emptySections}>No sections yet</Text>
            )}
          </View>
        </ScrollView>

        {/* Section Modal */}
        <Modal visible={showSectionModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {sectionForm.id ? 'Edit Section' : 'New Section'}
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Section Title *</Text>
                <TextInput
                  style={styles.input}
                  value={sectionForm.title}
                  onChangeText={text => setSectionForm({ ...sectionForm, title: text })}
                  placeholder="Enter section title"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowSectionModal(false);
                    resetSectionForm();
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveSection}
                >
                  <Text style={styles.saveButtonText}>
                    {sectionForm.id ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Lesson Modal */}
        <Modal visible={showLessonModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalView, { maxHeight: '80%' }]}>
              <Text style={styles.modalTitle}>
                {lessonForm.id ? 'Edit Lesson' : 'New Lesson'}
              </Text>
              
              <ScrollView>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Lesson Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={lessonForm.title}
                    onChangeText={text => setLessonForm({ ...lessonForm, title: text })}
                    placeholder="Enter lesson title"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Lesson Type</Text>
                  <View style={styles.typeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        lessonForm.type === 'text' && styles.typeOptionActive
                      ]}
                      onPress={() => setLessonForm({ ...lessonForm, type: 'text' })}
                    >
                      <Text>📝 Text</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        lessonForm.type === 'video' && styles.typeOptionActive
                      ]}
                      onPress={() => setLessonForm({ ...lessonForm, type: 'video' })}
                    >
                      <Text>🎥 Video</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {lessonForm.type === 'video' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput
                      style={styles.input}
                      value={lessonForm.duration}
                      onChangeText={text => setLessonForm({ ...lessonForm, duration: text })}
                      placeholder="e.g., 10:30"
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Content</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={lessonForm.content}
                    onChangeText={text => setLessonForm({ ...lessonForm, content: text })}
                    placeholder="Enter lesson content"
                    multiline
                    numberOfLines={6}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowLessonModal(false);
                    resetLessonForm();
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveLesson}
                >
                  <Text style={styles.saveButtonText}>
                    {lessonForm.id ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Lesson View Screen
  if (currentScreen === 'lesson' && selectedLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedLesson(null);
              setCurrentScreen('courseDetail');
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedLesson.title}
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                // Mark as completed
                Alert.alert('Success', 'Lesson marked as completed');
              }}
            >
              <Text style={styles.headerButtonText}>✓ Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.lessonContent}>
          <View style={styles.lessonHeader}>
            <Text style={styles.lessonType}>
              {selectedLesson.type === 'video' ? '🎥 Video Lesson' : '📝 Text Lesson'}
            </Text>
            {selectedLesson.duration && (
              <Text style={styles.lessonDuration}>Duration: {selectedLesson.duration}</Text>
            )}
          </View>

          <View style={styles.lessonBody}>
            {selectedLesson.type === 'video' ? (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoPlaceholderText}>🎬 Video Player</Text>
                <Text style={styles.videoUrl}>{selectedLesson.content}</Text>
              </View>
            ) : (
              <View style={styles.textContent}>
                <Text style={styles.textContentText}>{selectedLesson.content}</Text>
              </View>
            )}
          </View>

          <View style={styles.lessonFooter}>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Auth Styles
  authHeader: {
    backgroundColor: '#6200ee',
    padding: 40,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    elevation: 4,
  },
  authCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  authLink: {
    color: '#6200ee',
  },
  socialAuth: {
    marginTop: 24,
    alignItems: 'center',
  },
  socialAuthText: {
    color: '#666',
    marginBottom: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  headerButtonText: {
    color: '#fff',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
  },
  // User Info
  userInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#666',
    marginTop: 4,
  },
  // Search and Filters
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6200ee',
  },
  // Course Card
  courseCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  courseActions: {
    flexDirection: 'row',
  },
  courseActionText: {
    fontSize: 18,
    marginLeft: 12,
  },
  courseCategory: {
    color: '#6200ee',
    fontSize: 14,
    marginBottom: 4,
  },
  courseDescription: {
    color: '#666',
    marginBottom: 12,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseTeacher: {
    color: '#888',
    fontSize: 12,
  },
  courseStudents: {
    color: '#888',
    fontSize: 12,
  },
  createButton: {
    backgroundColor: '#6200ee',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Course Detail
  courseDetailContent: {
    flex: 1,
  },
  courseDetailHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  courseDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseDetailCategory: {
    color: '#6200ee',
    fontSize: 16,
    marginBottom: 8,
  },
  courseDetailTeacher: {
    color: '#666',
    marginBottom: 16,
  },
  courseDetailSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  courseDetailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  courseDetailText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  enrollButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  enrolledBadge: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrolledBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Section
  sectionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionActions: {
    flexDirection: 'row',
  },
  sectionAction: {
    marginLeft: 12,
    color: '#6200ee',
  },
  emptySections: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  // Lesson
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
  },
  lessonIcon: {
    width: 30,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
  },
  lessonDuration: {
    fontSize: 12,
    color: '#666',
  },
  lessonActions: {
    flexDirection: 'row',
  },
  lessonAction: {
    marginLeft: 8,
    fontSize: 16,
  },
  emptyLessons: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 10,
  },
  // Lesson View
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lessonType: {
    fontSize: 18,
    marginBottom: 8,
  },
  lessonBody: {
    padding: 20,
  },
  videoPlaceholder: {
    backgroundColor: '#000',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  videoPlaceholderText: {
    color: '#fff',
    fontSize: 24,
  },
  videoUrl: {
    color: '#fff',
    marginTop: 8,
  },
  textContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    minHeight: 200,
  },
  textContentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  lessonFooter: {
    padding: 20,
  },
  completeButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Admin Styles
  adminContent: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    color: '#666',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
  },
  userItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  userItemInfo: {
    flex: 1,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userItemEmail: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  userItemMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  userItemRole: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    marginRight: 8,
  },
  userItemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  statusActive: {
    backgroundColor: '#e8f5e8',
    color: '#4caf50',
  },
  statusInactive: {
    backgroundColor: '#ffebee',
    color: '#f44336',
  },
  userItemActions: {
    flexDirection: 'row',
  },
  userItemAction: {
    marginLeft: 12,
  },
  categoryItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  categoryName: {
    fontSize: 16,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  categoryAction: {
    marginLeft: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  roleOptionActive: {
    backgroundColor: '#6200ee',
  },
  roleOptionTextActive: {
    color: '#fff',
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  typeOptionActive: {
    backgroundColor: '#6200ee',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryOptionActive: {
    backgroundColor: '#6200ee',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  saveButtonText: {
    color: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6200ee',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6200ee',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  recoveryText: {
    marginBottom: 16,
    color: '#666',
    textAlign: 'center',
  },
});