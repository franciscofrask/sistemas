"use client";
import React, { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/Layout/ProtectedLayout';
import {
    Container,
    Paper,
    Title,
    Table,
    Group,
    Text,
    Badge,
    ActionIcon,
    Button,
    Modal,
    TextInput,
    Select,
    LoadingOverlay,
    Avatar,
    Tooltip,
    Stack,
    Card,
    Grid,
    Alert,
    Menu,
    Switch,
} from '@mantine/core';
import {
    IconUserPlus,
    IconEdit,
    IconTrash,
    IconEye,
    IconUser,
    IconMail,
    IconCalendar,
    IconShield,
    IconDots,
    IconUserCheck,
    IconUserX,
    IconRefresh,
    IconSettings,
    IconCheck,
    IconX,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const AdminUsuarios = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'create', 'permisos'
    const [saving, setSaving] = useState(false);
    
    // Estados para gestión de permisos
    const [userPermisos, setUserPermisos] = useState([]);
    const [funcionalidades, setFuncionalidades] = useState([]);
    const [loadingPermisos, setLoadingPermisos] = useState(false);

    // Verificar si es administrador
    useEffect(() => {
        if (session && session.user?.role !== 'admin') {
            router.push('/');
            alert('No tiene permisos para acceder a esta sección');
        }
    }, [session, router]);

    // Cargar usuarios
    const loadUsers = async () => {
        if (!session?.user?.token) return;
        
        setLoading(true);
        try {
            const response = await fetch('/api/admin/usuarios', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                }
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                setUsers(result.data || []);
            } else {
                alert(result.mensaje || 'Error al cargar usuarios');
            }
        } catch (error) {
            alert('Error de conexión al cargar usuarios');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            loadUsers();
            loadFuncionalidades();
        }
    }, [session]);

    // Cargar funcionalidades
    const loadFuncionalidades = async () => {
        if (!session?.user?.token) return;
        
        try {
            const response = await fetch('/api/admin/funcionalidades', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                }
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                setFuncionalidades(result.data || []);
            }
        } catch (error) {
            console.error('Error al cargar funcionalidades:', error);
        }
    };

    // Cargar permisos de usuario
    const loadUserPermisos = async (userId) => {
        if (!session?.user?.token) return;
        
        setLoadingPermisos(true);
        try {
            const response = await fetch(`/api/admin/usuarios/${userId}/permisos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                }
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                setUserPermisos(result.data || []);
            } else {
                alert(result.message || 'Error al cargar permisos');
            }
        } catch (error) {
            alert('Error de conexión al cargar permisos');
        }
        setLoadingPermisos(false);
    };

    // Actualizar permiso de rol
    const updateRolePermiso = async (rolId, funcionalidadId, puedeAcceder) => {
        if (!session?.user?.token) return;
        
        try {
            const response = await fetch(`/api/admin/roles/${rolId}/permisos`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                },
                body: JSON.stringify({
                    funcionalidad_id: funcionalidadId,
                    puede_acceder: puedeAcceder ? 1 : 0
                })
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                alert('Permiso actualizado correctamente');
                // Recargar permisos del usuario
                loadUserPermisos(selectedUser.id);
            } else {
                alert(result.message || 'Error al actualizar permiso');
            }
        } catch (error) {
            alert('Error de conexión al actualizar permiso');
        }
    };

    // Crear usuario
    const createUser = async () => {
        if (!editingUser || !session?.user?.token) return;
        
        setSaving(true);
        try {
            const response = await fetch('/api/admin/usuarios/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                },
                body: JSON.stringify(editingUser)
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                alert('Usuario creado exitosamente');
                closeModal();
                loadUsers(); // Recargar la lista
                setEditingUser(null);
            } else {
                alert(result.message || 'Error al crear usuario');
            }
        } catch (error) {
            console.error('Error creando usuario:', error);
            alert('Error de conexión al crear usuario');
        }
        setSaving(false);
    };

    // Actualizar usuario
    const updateUser = async () => {
        if (!editingUser || !session?.user?.token) return;
        
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/usuarios/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                },
                body: JSON.stringify(editingUser)
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                alert('Usuario actualizado correctamente');
                loadUsers();
                closeModal();
            } else {
                alert(result.mensaje || 'Error al actualizar usuario');
            }
        } catch (error) {
            alert('Error de conexión al actualizar usuario');
        }
        setSaving(false);
    };

    // Cambiar rol del usuario (función rápida desde el dropdown)
    const changeUserRole = async (userId, newRolId) => {
        if (!session?.user?.token) return;
        
        try {
            const response = await fetch(`/api/admin/usuarios/${userId}/rol`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.token}`
                },
                body: JSON.stringify({ rol_id: newRolId })
            });
            
            const result = await response.json();
            if (response.ok && result.success) {
                alert('Rol actualizado correctamente');
                loadUsers();
                closeModal();
            } else {
                alert(result.mensaje || 'Error al actualizar rol');
            }
        } catch (error) {
            alert('Error de conexión al actualizar rol');
        }
    };

    const openUserModal = (type, user = null) => {
        setModalType(type);
        setSelectedUser(user);
        
        if (type === 'edit' && user) {
            // Formatear fechas para el formulario
            const formatDateForInput = (date) => {
                if (!date) return '';
                const dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) return '';
                return dateObj.toISOString().split('T')[0];
            };

            // Crear una copia del usuario para editar
            setEditingUser({
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                nombre_usuario: user.nombre_usuario,
                correo: user.correo,
                rol_id: user.rol_id,
                fecha_nacimiento: formatDateForInput(user.fecha_nacimiento),
                fecha_incorporacion: formatDateForInput(user.fecha_incorporacion)
            });
        } else if (type === 'create') {
            // Inicializar formulario para nuevo usuario
            setEditingUser({
                nombre: '',
                apellido: '',
                nombre_usuario: '',
                correo: '',
                contrasena: '',
                rol_id: 2, // Usuario por defecto
                fecha_incorporacion: new Date().toISOString().split('T')[0]
            });
        } else if (type === 'permisos' && user) {
            // Cargar permisos del usuario
            loadUserPermisos(user.id);
        } else {
            setEditingUser(null);
        }
        
        openModal();
    };

    const getRoleBadge = (rol_id, rol) => {
        const colors = {
            1: 'red',     // admin
            2: 'blue',    // usuario
            3: 'orange'   // manager
        };
        return (
            <Badge color={colors[rol_id] || 'gray'} variant="light" size="sm">
                {rol || 'Sin rol'}
            </Badge>
        );
    };

    const getStatusBadge = (activo) => {
        return (
            <Badge 
                color={activo ? 'green' : 'red'} 
                variant="light" 
                size="sm"
            >
                {activo ? 'Activo' : 'Inactivo'}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrado';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
           
        });
    };

    if (session?.user?.role !== 'admin') {
        return null;
    }

    return (
        <ProtectedLayout>
            <Container fluid>
            <Paper p="xl" shadow="sm" style={{ backgroundColor: 'white', borderRadius: '12px' }}>
                <Group justify="space-between" mb="xl">
                    <div>
                        <Title order={2} c="#EE0E0F" mb="xs">
                            Administración de Usuarios
                        </Title>
                        <Text c="dimmed" size="sm">
                            Gestionar usuarios del sistema, roles y permisos
                        </Text>
                    </div>
                    <Group>
                        <Button
                            leftSection={<IconRefresh size={16} />}
                            variant="light"
                            onClick={loadUsers}
                            loading={loading}
                        >
                            Actualizar
                        </Button>
                        <Button
                            leftSection={<IconUserPlus size={16} />}
                            onClick={() => openUserModal('create')}
                            style={{
                                background: 'linear-gradient(45deg, #EE0E0F, #FF4444)',
                                border: 'none'
                            }}
                        >
                            Nuevo Usuario
                        </Button>
                    </Group>
                </Group>

                {users.length === 0 && !loading ? (
                    <Alert icon={<IconUser size={16} />} title="Sin usuarios" color="blue">
                        No hay usuarios registrados en el sistema.
                    </Alert>
                ) : (
                    <Paper withBorder style={{ overflow: 'hidden' }}>
                        <LoadingOverlay visible={loading} />
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <Table.Th>Usuario</Table.Th>
                                    <Table.Th>Contacto</Table.Th>
                                    <Table.Th>Rol</Table.Th>
                                    <Table.Th>Estado</Table.Th>
                                    <Table.Th>Incorporación</Table.Th>
                                    <Table.Th>Baja</Table.Th>
                                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {users.map((user) => (
                                    <Table.Tr key={user.id}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                <Avatar 
                                                    color={user.activo ? "#EE0E0F" : "gray"} 
                                                    size="md"
                                                    style={{
                                                        background: user.activo 
                                                            ? 'linear-gradient(45deg, #EE0E0F, #FF4444)' 
                                                            : '#gray'
                                                    }}
                                                >
                                                    {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
                                                </Avatar>
                                                <div>
                                                    <Text fw={500} size="sm">
                                                        {`${user.nombre} ${user.apellido}`}
                                                    </Text>
                                                    <Text c="dimmed" size="xs">
                                                        @{user.nombre_usuario}
                                                    </Text>
                                                </div>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <IconMail size={14} color="#666" />
                                                <Text size="sm">{user.correo}</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            {getRoleBadge(user.rol_id, user.rol)}
                                        </Table.Td>
                                        <Table.Td>
                                            {getStatusBadge(user.activo)}
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {formatDate(user.fecha_incorporacion)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {formatDate(user.fecha_baja)}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs" justify="center">
                                                <Menu shadow="md" width={180} position="bottom-end">
                                                    <Menu.Target>
                                                        <ActionIcon variant="subtle" color="gray">
                                                            <IconDots size={16} />
                                                        </ActionIcon>
                                                    </Menu.Target>

                                                    <Menu.Dropdown>
                                                        <Menu.Item
                                                            leftSection={<IconEye size={14} />}
                                                            onClick={() => openUserModal('view', user)}
                                                        >
                                                            Ver detalles
                                                        </Menu.Item>
                                                        
                                                        <Menu.Item
                                                            leftSection={<IconEdit size={14} />}
                                                            onClick={() => openUserModal('edit', user)}
                                                        >
                                                            Editar
                                                        </Menu.Item>

                                                        <Menu.Item
                                                            leftSection={<IconSettings size={14} />}
                                                            onClick={() => openUserModal('permisos', user)}
                                                        >
                                                            Gestionar Permisos
                                                        </Menu.Item>

                                                        <Menu.Divider />

                                                        <Menu.Item
                                                            leftSection={<IconUserX size={14} />}
                                                            color="red"
                                                            onClick={() => console.log('Desactivar usuario', user.id)}
                                                        >
                                                            Desactivar
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                )}
            </Paper>

            {/* Modal para ver/editar usuario */}
            <Modal
                opened={modalOpened}
                onClose={closeModal}
                title={
                    modalType === 'view' ? 'Detalles del Usuario' :
                    modalType === 'edit' ? 'Editar Usuario' :
                    modalType === 'permisos' ? 'Gestionar Permisos' : 'Nuevo Usuario'
                }
                size="lg"
            >
                {modalType === 'permisos' && selectedUser ? (
                    // Vista de gestión de permisos
                    <Stack gap="md">
                        <Card withBorder>
                            <Group justify="space-between" mb="md">
                                <div>
                                    <Text size="lg" fw={600}>
                                        {selectedUser.nombre_completo}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        Rol: {selectedUser.rol || 'Sin rol asignado'}
                                    </Text>
                                </div>
                                <Badge variant="light" color="blue">
                                    Gestión de Permisos
                                </Badge>
                            </Group>
                        </Card>

                        {loadingPermisos ? (
                            <LoadingOverlay visible={true} />
                        ) : (
                            <Paper withBorder p="md">
                                <Title order={4} mb="md">Funcionalidades y Permisos</Title>
                                
                                {userPermisos.length > 0 ? (
                                    <Table>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Funcionalidad</Table.Th>
                                                <Table.Th>Descripción</Table.Th>
                                                <Table.Th>Ruta</Table.Th>
                                                <Table.Th>Acceso</Table.Th>
                                                <Table.Th>Acción</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {userPermisos.map((permiso) => (
                                                <Table.Tr key={permiso.funcionalidad_id}>
                                                    <Table.Td>
                                                        <Text fw={500}>{permiso.funcionalidad_nombre}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" c="dimmed">
                                                            {permiso.funcionalidad_descripcion}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" ff="monospace" c="blue">
                                                            {permiso.funcionalidad_ruta}
                                                        </Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge 
                                                            color={permiso.puede_acceder ? 'green' : 'red'} 
                                                            variant="light"
                                                        >
                                                            {permiso.puede_acceder ? 'Permitido' : 'Denegado'}
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Switch
                                                            checked={Boolean(permiso.puede_acceder)}
                                                            onChange={(event) => 
                                                                updateRolePermiso(
                                                                    permiso.rol_id,
                                                                    permiso.funcionalidad_id,
                                                                    event.currentTarget.checked
                                                                )
                                                            }
                                                            color="green"
                                                            size="sm"
                                                        />
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                ) : (
                                    <Alert color="orange">
                                        No se encontraron permisos para este usuario
                                    </Alert>
                                )}
                            </Paper>
                        )}
                        
                        <Group justify="flex-end" mt="lg">
                            <Button variant="light" onClick={closeModal}>
                                Cerrar
                            </Button>
                        </Group>
                    </Stack>
                ) : ((modalType === 'view' ? selectedUser : editingUser) && (
                    <Stack gap="md">
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Nombre"
                                    value={modalType === 'view' ? selectedUser?.nombre : editingUser?.nombre || ''}
                                    onChange={(e) => (modalType === 'edit' || modalType === 'create') && setEditingUser({...editingUser, nombre: e.target.value})}
                                    readOnly={modalType === 'view'}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Apellido"
                                    value={modalType === 'view' ? selectedUser?.apellido : editingUser?.apellido || ''}
                                    onChange={(e) => (modalType === 'edit' || modalType === 'create') && setEditingUser({...editingUser, apellido: e.target.value})}
                                    readOnly={modalType === 'view'}
                                />
                            </Grid.Col>
                            
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Nombre de Usuario"
                                    value={modalType === 'view' ? selectedUser?.nombre_usuario : editingUser?.nombre_usuario || ''}
                                    onChange={(e) => (modalType === 'edit' || modalType === 'create') && setEditingUser({...editingUser, nombre_usuario: e.target.value})}
                                    readOnly={modalType === 'view'}
                                    placeholder={modalType === 'create' ? 'Usuario único para login' : ''}
                                />
                            </Grid.Col>
                            
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Email"
                                    value={modalType === 'view' ? selectedUser?.correo : editingUser?.correo || ''}
                                    onChange={(e) => (modalType === 'edit' || modalType === 'create') && setEditingUser({...editingUser, correo: e.target.value})}
                                    readOnly={modalType === 'view'}
                                    placeholder={modalType === 'create' ? 'usuario@ejemplo.com' : ''}
                                />
                            </Grid.Col>
                            
                            {modalType === 'create' && (
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Contraseña"
                                        type="password"
                                        value={editingUser?.contrasena || ''}
                                        onChange={(e) => setEditingUser({...editingUser, contrasena: e.target.value})}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </Grid.Col>
                            )}
                            
                            {modalType !== 'view' && (
                                <Grid.Col span={6}>
                                    <Select
                                        label="Rol"
                                        value={editingUser?.rol_id?.toString() || ''}
                                        data={[
                                            { value: '1', label: 'Administrador' },
                                            { value: '2', label: 'Usuario' },
                                            { value: '3', label: 'Manager' }
                                        ]}
                                        onChange={(value) => {
                                            if (value) setEditingUser({...editingUser, rol_id: parseInt(value)});
                                        }}
                                    />
                                </Grid.Col>
                            )}
                            {modalType === 'view' && (
                                <>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="Rol"
                                            value={selectedUser?.rol || 'No asignado'}
                                            readOnly
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="Fecha de Nacimiento"
                                            value={selectedUser?.fecha_nacimiento ? formatDate(selectedUser.fecha_nacimiento) : 'No registrado'}
                                            readOnly
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <TextInput
                                            label="Fecha de Incorporación"
                                            value={selectedUser?.fecha_incorporacion ? formatDate(selectedUser.fecha_incorporacion) : 'No registrado'}
                                            readOnly
                                        />
                                    </Grid.Col>
                                </>
                            )}
                        </Grid>
                        
                        {(modalType === 'edit' || modalType === 'create') && (
                            <Group justify="flex-end" mt="lg">
                                <Button 
                                    variant="light" 
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={modalType === 'create' ? createUser : updateUser}
                                    loading={saving}
                                    style={{
                                        background: 'linear-gradient(45deg, #EE0E0F, #FF4444)',
                                        border: 'none'
                                    }}
                                >
                                    {modalType === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                                </Button>
                            </Group>
                        )}
                    </Stack>
                ))}
            </Modal>
        </Container>
        </ProtectedLayout>
    );
};

export default AdminUsuarios;