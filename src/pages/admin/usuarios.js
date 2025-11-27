"use client";
import React, { useState, useEffect } from 'react';
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
    const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'create'
    const [saving, setSaving] = useState(false);

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
        }
    }, [session]);

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
            // Crear una copia del usuario para editar
            setEditingUser({
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                nombre_usuario: user.nombre_usuario,
                correo: user.correo,
                rol_id: user.rol_id
            });
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
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (session?.user?.role !== 'admin') {
        return null;
    }

    return (
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
                    modalType === 'edit' ? 'Editar Usuario' : 'Nuevo Usuario'
                }
                size="lg"
            >
                {(modalType === 'view' ? selectedUser : editingUser) && (
                    <Stack gap="md">
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Nombre"
                                    value={modalType === 'view' ? selectedUser.nombre : editingUser?.nombre || ''}
                                    onChange={(e) => modalType === 'edit' && setEditingUser({...editingUser, nombre: e.target.value})}
                                    readOnly={modalType === 'view'}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Apellido"
                                    value={modalType === 'view' ? selectedUser.apellido : editingUser?.apellido || ''}
                                    onChange={(e) => modalType === 'edit' && setEditingUser({...editingUser, apellido: e.target.value})}
                                    readOnly={modalType === 'view'}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Usuario"
                                    value={modalType === 'view' ? selectedUser.nombre_usuario : editingUser?.nombre_usuario || ''}
                                    onChange={(e) => modalType === 'edit' && setEditingUser({...editingUser, nombre_usuario: e.target.value})}
                                    readOnly={modalType === 'view'}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Email"
                                    value={modalType === 'view' ? selectedUser.correo : editingUser?.correo || ''}
                                    onChange={(e) => modalType === 'edit' && setEditingUser({...editingUser, correo: e.target.value})}
                                    readOnly={modalType === 'view'}
                                />
                            </Grid.Col>
                            {modalType !== 'view' && (
                                <Grid.Col span={12}>
                                    <Select
                                        label="Rol"
                                        value={editingUser?.rol_id?.toString() || ''}
                                        data={[
                                            { value: '1', label: 'Administrador' },
                                            { value: '2', label: 'Usuario' },
                                            { value: '3', label: 'Gerente' }
                                        ]}
                                        onChange={(value) => {
                                            if (value) setEditingUser({...editingUser, rol_id: parseInt(value)});
                                        }}
                                    />
                                </Grid.Col>
                            )}
                            {modalType === 'view' && (
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Rol"
                                        value={selectedUser.rol}
                                        readOnly
                                    />
                                </Grid.Col>
                            )}
                        </Grid>
                        
                        {modalType === 'edit' && (
                            <Group justify="flex-end" mt="lg">
                                <Button 
                                    variant="light" 
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={updateUser}
                                    loading={saving}
                                    style={{
                                        background: 'linear-gradient(45deg, #EE0E0F, #FF4444)',
                                        border: 'none'
                                    }}
                                >
                                    Guardar Cambios
                                </Button>
                            </Group>
                        )}
                    </Stack>
                )}
            </Modal>
        </Container>
    );
};

export default AdminUsuarios;