# Firestore Schema (ssr-juniors)

## students/{uid}

- name: string
- class: string
- parentPhone: string
- authUid: string
- createdAt: timestamp
- updatedAt: timestamp

## students/{uid}/devices/{deviceId}

- token: string
- lastUsedAt: timestamp

## students/{uid}/fees/{monthId}

- month: string
- amount: number
- status: "PAID" | "UNPAID"
- paidAt?: timestamp

## students/{uid}/notifications/{notificationId}

- read: boolean
- readAt?: timestamp

## admins/{uid}

- name: string
- role: "admin"
- createdAt: timestamp

## notifications/{id}

- title: string
- message: string
- targetType: "ALL" | "CLASS" | "USER"
- targetValue: string
- createdAt: timestamp
